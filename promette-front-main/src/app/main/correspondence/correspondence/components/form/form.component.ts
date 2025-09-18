import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, of } from 'rxjs';
import {
  map,
  filter as rxFilter,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CoreModalService } from '../../../../../core/services/core.modal.service';
import { CorrespondenceService } from '../../services/correspondence.service';
import { CoreAlertService } from '../../../../../core/services/core.alert.service';

@Component({
  selector: 'correspondence-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    AutoCompleteModule,
  ],
  templateUrl: './form.component.html',
})
export class CorrespondenceAddFormComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Input() id_usuario: any; // <-- Nuevo input para recibir id_usuario directo
  form: FormGroup;
  selectedFile: File | null = null;
  prioridades: any[] = [];
  formasEntrega: any[] = [];
  estadosCorrespondencia: any[] = [];
  today: string = new Date().toISOString().split('T')[0];

  filteredRemitentes: any[] = [];
  filteredDestinatarios: any[] = [];
  selectedDestinatario: any = null;
  selectedRemitente: any = null;

  public isSaving: boolean = false;
  public isSuccess: boolean = false;
  public isHovered: boolean = false;
  public particles: { x: number }[] = [];

  private autoQuery$ = new Subject<{
    term: string;
    tipo: 'destinatario' | 'remitente';
  }>();
  private autoSub?: Subscription;
  private composing = false;
  private autoCache = new Map<string, any[]>();

  private pendingCloseTimer: any = null;
  private lastPointerSelection = false;
  private phantomClickBlockUntil = 0;
  private docClickListener?: (e: Event) => void;

  constructor(
    private fb: FormBuilder,
    private modalService: CoreModalService,
    private correspondenceService: CorrespondenceService,
    private alertService: CoreAlertService
  ) {
    // El FormGroup se inicializará en ngOnInit donde `this.data` está disponible.
    this.form = this.fb.group({});
  }
  //ngOnit se usa para inicializar el componente y cargar los datos necesarios en el formulario de correspondencia
  ngOnInit() {
    this.particles = Array.from({ length: 6 }, () => ({
      x: Math.random() * 220,
    }));
    // Inicializar el formulario aquí, donde this.data está disponible.
    if (this.data?.mode === 'status') {
      this.form = this.fb.group({
        ct_correspondencia_estado: [null, Validators.required],
        observaciones: ['', [Validators.required, Validators.maxLength(300)]],
        destinatario_1: [''], // Requerido condicionalmente
        remitente_1: [''], // Requerido condicionalmente
        ruta_correspondencia: [null], // Para el PDF opcional
        ct_usuarios_in: [''],
      });
    } else {
      this.form = this.fb.group({
        ct_clasificacion_prioridad_id: [null, Validators.required],
        ct_forma_entrega_id: [null, Validators.required],
        fecha_correspondencia: ['', Validators.required],
        destinatario_1: ['', Validators.required],
        remitente_1: ['', Validators.required],
        resumen: ['', [Validators.required, Validators.maxLength(300)]],
        observaciones: [''],
        ruta_correspondencia: [null, [Validators.required]],
        folio_correspondencia: [
          '',
          [Validators.required, Validators.maxLength(50)],
        ],
        ct_usuarios_in: [''],
      });
    }

    let estadosLoaded = false;
    let formasEntregaLoaded = false;
    const trySetObservaciones = () => {
      if (
        this.data?.mode === 'status' &&
        this.data.correspondencia &&
        estadosLoaded &&
        formasEntregaLoaded
      ) {
        const obs = this.data.correspondencia.observaciones || '';
        this.form.get('observaciones')?.setValue(obs);
        // Nos sirve para obtener el id de estado de la correspondencia
        const idEstado = this.getIdEstadoCorrespondencia();
        this.form.get('ct_correspondencia_estado')?.setValue(idEstado);
        this.form.get('observaciones')?.markAsTouched();
        this.form.get('ct_correspondencia_estado')?.markAsTouched();
      }
    };
    this.correspondenceService.getEstadosCorrespondencia().subscribe({
      next: (resp: any) => {
        this.estadosCorrespondencia = resp.data || resp;
        estadosLoaded = true;
        const idEstado = this.getIdEstadoCorrespondencia();
        if (this.data?.mode === 'status' && idEstado) {
          this.estadosCorrespondencia = this.estadosCorrespondencia.filter(
            (e: any) => e.id_correspondencia_estado >= idEstado
          );
        }
        this.form.get('ct_correspondencia_estado')?.setValue(idEstado);
        trySetObservaciones();
        if (this.data?.mode === 'status') {
          this.form
            .get('observaciones')
            ?.setValidators([Validators.required, Validators.maxLength(300)]);
          this.form.get('observaciones')?.updateValueAndValidity();
        }
        this.setFormValuesIfEdit();
      },
      error: (err) => {
        // console.error('Error al cargar estados de correspondencia:', err);
        estadosLoaded = true;
        trySetObservaciones();
        this.setFormValuesIfEdit();
      },
    });
    this.correspondenceService.getFormaEntrega().subscribe({
      next: (resp: any) => {
        this.formasEntrega = resp.data || resp;
        formasEntregaLoaded = true;
        trySetObservaciones();
        this.setFormValuesIfEdit();
      },
      error: (err) => {
        // console.error('Error al cargar formas de entrega:', err);
        formasEntregaLoaded = true;
        trySetObservaciones();
        this.setFormValuesIfEdit();
      },
    });
    this.correspondenceService.getClasificacionPrioridad().subscribe({
      next: (resp: any) => {
        this.prioridades = resp.data || resp;
        this.setFormValuesIfEdit();
      },
      error: (err) => {
        // console.error('Error al cargar prioridades:', err);
        this.setFormValuesIfEdit();
      },
    });

    // Ajustar validadores según el modo
    if (this.data?.mode === 'status') {
      // Solo se editan los campos de estado y observación en el modal de estado
      this.form
        .get('ct_clasificacion_prioridad_id')
        ?.setValidators(Validators.required);
      this.form.get('ct_clasificacion_prioridad_id')?.updateValueAndValidity();
      this.form
        .get('resumen')
        ?.setValidators([Validators.required, Validators.maxLength(300)]);
      this.form.get('resumen')?.updateValueAndValidity();
      // (patchValue movido al subscribe de prioridades)
    }

    // Si el usuario selecciona un destinatario, guardar el objeto (solo en add)
    this.form.get('destinatario_1')?.valueChanges.subscribe((val) => {
      if (typeof val === 'object' && val && val.id_usuario_puesto) {
        this.selectedDestinatario = val;
        // Si no tiene área pero tiene nombre_area, asignarla
        if (
          !this.selectedDestinatario.area &&
          this.selectedDestinatario.nombre_area
        ) {
          this.selectedDestinatario.area =
            this.selectedDestinatario.nombre_area;
        }
      } else {
        this.selectedDestinatario = null;
      }
    });

    this.form.get('remitente_1')?.valueChanges.subscribe((val) => {
      if (typeof val === 'object' && val && val.id_usuario_puesto) {
        this.selectedRemitente = val;
        // Si no tiene área pero tiene nombre_area, asignarla
        if (
          !this.selectedRemitente.area &&
          this.selectedRemitente.nombre_area
        ) {
          this.selectedRemitente.area = this.selectedRemitente.nombre_area;
        }
      } else {
        this.selectedRemitente = null;
      }
    });

    // Si cambia el estado, actualizar la validez y el validador del campo remitente SOLO en status
    if (this.data?.mode === 'status') {
      this.form
        .get('ct_correspondencia_estado')
        ?.valueChanges.subscribe((estado) => {
          const destinatarioCtrl = this.form.get('destinatario_1');
          const remitenteCtrl = this.form.get('remitente_1');

          if (estado === 4) {
            destinatarioCtrl?.setValidators(Validators.required);
            remitenteCtrl?.setValidators(Validators.required);
          } else {
            destinatarioCtrl?.clearValidators();
            remitenteCtrl?.clearValidators();
            destinatarioCtrl?.setValue('');
            remitenteCtrl?.setValue('');
          }
          destinatarioCtrl?.updateValueAndValidity();
          remitenteCtrl?.updateValueAndValidity();
        });
    }

    // Establecer el id_usuario en el campo ct_usuarios_in
    let id_usuario_final = '';
    if (this.data?.currentUser?.user?.id_usuario) {
      id_usuario_final = this.data.currentUser.user.id_usuario;
    } else if (this.data?.currentUser?.user?.ct_usuario_in) {
      id_usuario_final = this.data.currentUser.user.ct_usuario_in;
    } else if (this.data?.id_usuario) {
      id_usuario_final = this.data.id_usuario;
    } else if (this.id_usuario) {
      id_usuario_final = this.id_usuario;
    }
    this.form.get('ct_usuarios_in')?.setValue(id_usuario_final);

    this.initAutoCompleteStream();

    // Click fantasma iOS suppression
    this.docClickListener = (e: Event) => {
      if (Date.now() < this.phantomClickBlockUntil) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    document.addEventListener('click', this.docClickListener, true);
  }

  private getIdEstadoCorrespondencia(): any {
    try {
      return this.data?.correspondencia?.rl_correspondencia_usuario_estados
        ?.length
        ? this.data.correspondencia.rl_correspondencia_usuario_estados[
            this.data.correspondencia.rl_correspondencia_usuario_estados
              .length - 1
          ]?.id_correspondencia_estado
        : null;
    } catch {
      return null;
    }
  }

  private initAutoCompleteStream() {
    this.autoSub = this.autoQuery$
      .pipe(
        rxFilter(({ term }) => !this.composing || term.length === 0),
        map(({ term, tipo }) => ({ term: this.normalizeTerm(term), tipo })),
        distinctUntilChanged(
          (a, b) => a.tipo === b.tipo && a.term === b.term && a.term.length > 1
        ),
        switchMap(({ term, tipo }) => {
          if (!term) return of({ results: [], tipo });
          const key = tipo + '|' + term;
          const useCache = term.length > 1;
          if (useCache && this.autoCache.has(key)) {
            return of({ results: this.autoCache.get(key) || [], tipo });
          }
          return this.correspondenceService.obtenerUsuarios(term).pipe(
            map((people: any[]) => this.mapPeople(term, tipo, people)),
            catchError(() => of([])),
            tap((list) => {
              if (useCache) this.autoCache.set(key, list);
            }),
            map((list) => ({ results: list, tipo }))
          );
        }),
        tap(({ results, tipo }) => {
          if (tipo === 'destinatario') this.filteredDestinatarios = results;
          else this.filteredRemitentes = results;
        })
      )
      .subscribe();
  }

  private normalizeTerm(t: string) {
    return (t || '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private mapPeople(
    term: string,
    tipo: 'destinatario' | 'remitente',
    people: any[]
  ) {
    const lowered = term.toLowerCase();
    const buildNombreCompleto = (info: any, pa: any = {}) => {
      const nombre = info.nombre || '';
      const ap1 = info.apellido_paterno || '';
      const ap2 = info.apellido_materno || '';
      const puesto = pa.puesto ? ' - ' + pa.puesto : '';
      const area =
        pa.area || pa.nombre_area ? ' - ' + (pa.area || pa.nombre_area) : '';
      return `${nombre} ${ap1} ${ap2}${puesto}${area}`.trim();
    };
    const filtered = people.filter((p) => {
      const info = p.informacion || p;
      const nombre = (info.nombre || '').toLowerCase();
      const ap1 = (info.apellido_paterno || '').toLowerCase();
      const ap2 = (info.apellido_materno || '').toLowerCase();
      const full = `${nombre} ${ap1} ${ap2}`;
      return (
        nombre.startsWith(lowered) ||
        ap1.startsWith(lowered) ||
        ap2.startsWith(lowered) ||
        full.includes(lowered)
      );
    });
    return filtered
      .flatMap((p) => {
        const info = p.informacion || p;
        if (Array.isArray(p.puestosYAreas) && p.puestosYAreas.length) {
          return p.puestosYAreas.map((pa: any) => ({
            ...p,
            id_usuario_puesto: pa.id_usuario_puesto,
            nombreCompleto: buildNombreCompleto(info, pa),
            puesto: pa.puesto,
            area: pa.area,
            nombre_area: pa.area || pa.nombre_area || '',
          }));
        }
        return [
          {
            ...p,
            id_usuario_puesto: p.id_usuario_puesto || p.id,
            nombreCompleto: buildNombreCompleto(info),
            puesto: '',
            area: '',
            nombre_area: '',
          },
        ];
      })
      .slice(0, 50);
  }

  // Handlers referenciados por la plantilla (reintegrados)
  onRawInput(ev: any, tipo: 'destinatario' | 'remitente') {
    const value = ev?.target?.value ?? '';
    this.autoQuery$.next({ term: value, tipo });
  }
  onCompositionStart() {
    this.composing = true;
  }
  onCompositionEnd(ev: any, tipo: 'destinatario' | 'remitente') {
    this.composing = false;
    const value = ev?.target?.value ?? '';
    this.autoQuery$.next({ term: value, tipo });
  }
  onAutoFocus(tipo: 'destinatario' | 'remitente') {
    const ctrl = this.form.get(
      tipo === 'destinatario' ? 'destinatario_1' : 'remitente_1'
    );
    const val = ctrl?.value;
    if (typeof val === 'string') {
      if (val.length >= 1) {
        this.autoQuery$.next({ term: val, tipo });
      } else {
        this.autoQuery$.next({ term: 'a', tipo });
      }
    }
  }
  // Método legacy que PrimeNG invoca; delegamos al flujo actual
  filterPeople(event: any, tipo: 'destinatario' | 'remitente') {
    const term = (event?.query || '').trim();
    this.autoQuery$.next({ term, tipo });
  }

  onCancel() {
    // Cierra el modal si está disponible
    try {
      this.modalService.close();
    } catch {}
  }
  //Valores del formulario al darle clic en el icono de editar
  private setFormValuesIfEdit() {
    if (
      (this.data?.mode === 'edit' || this.data?.mode === 'editFull') &&
      this.data.correspondencia
    ) {
      if (
        this.prioridades &&
        this.prioridades.length &&
        this.formasEntrega &&
        this.formasEntrega.length
      ) {
        // Buscar el id de prioridad y forma de entrega a partir del nombre si es necesario
        let idPrioridad =
          this.data.correspondencia.ct_clasificacion_prioridad_id;
        let idEntrega = this.data.correspondencia.ct_forma_entrega_id;
        // Si solo viene el nombre, buscar el id correspondiente y asignarlo
        if (!idPrioridad && this.data.correspondencia.nombre_prioridad) {
          const found = this.prioridades.find(
            (p: any) =>
              p.nombre_prioridad === this.data.correspondencia.nombre_prioridad
          );
          idPrioridad = found ? found.id_prioridad : '';
        }
        if (!idEntrega && this.data.correspondencia.nombre_entrega) {
          const found = this.formasEntrega.find(
            (e: any) =>
              e.nombre_entrega === this.data.correspondencia.nombre_entrega
          );
          idEntrega = found ? found.id_forma_entrega : '';
        }
        this.form.patchValue({
          ct_clasificacion_prioridad_id: idPrioridad || '',
          ct_forma_entrega_id: idEntrega || '',
          fecha_correspondencia:
            this.data.correspondencia.fecha_correspondencia || '',
          resumen: this.data.correspondencia.resumen_correspondencia || '',
          folio_correspondencia:
            this.data.correspondencia.folio_correspondencia || '',
        });
      }
    }
    // Devuelve el número de caracteres del campo resumen
  }
  getResumenCharCount(): number {
    const value = this.form.get('resumen')?.value;
    if (!value) return 0;
    return value.length;
  }

  getFolioCharCount(): number {
    const value = this.form.get('folio_correspondencia')?.value;
    if (!value) return 0;
    return value.length;
  }

  // Devuelve el número de caracteres del campo observaciones
  getObservacionesCharCount(): number {
    const value = this.form.get('observaciones')?.value;
    if (!value) return 0;
    return value.length;
  }

  // Devuelve el id_correspondencia_usuario válido desde rl_correspondencia_usuario_estado
  getIdCorrespondenciaUsuario(): number | undefined {
    const correspondencia = this.data?.correspondencia;
    const id_usuario = Number(localStorage.getItem('id_usuario'));
    // 1. Busca en el root
    if (correspondencia?.id_correspondencia_usuario) {
      return correspondencia.id_correspondencia_usuario;
    }
    // 2. Busca en rl_correspondencia_usuario_estado
    if (
      correspondencia?.rl_correspondencia_usuario_estado &&
      correspondencia.rl_correspondencia_usuario_estado
        .id_correspondencia_usuario
    ) {
      return correspondencia.rl_correspondencia_usuario_estado
        .id_correspondencia_usuario;
    }
    // 3. Busca en rl_correspondencia_usuario_estados por el usuario actual
    if (Array.isArray(correspondencia?.rl_correspondencia_usuario_estados)) {
      const match = correspondencia.rl_correspondencia_usuario_estados.find(
        (r: any) => r.ct_usuarios_in === id_usuario
      );
      if (match?.id_correspondencia_usuario) {
        return match.id_correspondencia_usuario;
      }
    }
    // 4. Si no encuentra nada, undefined

    return undefined;
  }

  onError(event: any) {
    let msg = 'Error al subir el archivo.';
    if (event && event.error && event.error.message) {
      msg += ' ' + event.error.message;
    } else if (event && event.type === 'invalidFileSize') {
      msg += ' El archivo es demasiado grande (máx. 1MB).';
    } else if (event && event.type === 'invalidFileType') {
      msg += ' Solo se permiten archivos PDF.';
    }
    this.alertService.error(msg);
    // console.error('Error en la subida del archivo:', event);
  }

  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.get('ruta_correspondencia')?.setValue(file.name);
      this.form.get('ruta_correspondencia')?.markAsTouched();
      this.form.get('ruta_correspondencia')?.updateValueAndValidity();
    }
  }

  onFileClear() {
    this.selectedFile = null;
    this.form.get('ruta_correspondencia')?.setValue(null);
    this.form.get('ruta_correspondencia')?.markAsTouched();
    this.form.get('ruta_correspondencia')?.updateValueAndValidity();
  }

  // El usuario debe seleccionar o escribir un destinatario para poder guardar
  isDestinatarioValido(): boolean {
    const destinatario = this.form.get('destinatario_1')?.value;
    return (
      destinatario &&
      typeof destinatario === 'object' &&
      !!destinatario.id_usuario_puesto
    );
  }

  onSubmit() {
    if (this.isSaving) return;
    this.isSaving = true;
    let destinatarioRequerido = true;
    let destinatarioIdUsuarioPuesto = null;
    const destinatarioCtrl = this.form.get('destinatario_1');
    let estado = this.form.get('ct_correspondencia_estado')?.value;

    // Solo en status: destinatario solo es requerido y enviado si el estado es 4 (returnada)
    if (this.data?.mode === 'status') {
      destinatarioRequerido = estado === 4;
      if (!destinatarioRequerido && destinatarioCtrl) {
        destinatarioCtrl.setValue('');
      }
    }

    // Validar destinatario solo si es requerido
    if (destinatarioRequerido && destinatarioCtrl) {
      let destinatarioObj = destinatarioCtrl.value;
      if (destinatarioObj === '' || destinatarioObj === null) {
        if (this.data?.mode !== 'status' || estado === 4) {
          this.alertService.error(
            'Debe seleccionar un destinatario válido de la lista.'
          );
          destinatarioCtrl.markAsTouched();
          this.isSaving = false;
          return;
        }
        // En status, si el campo está oculto y no es estado 4, no mostrar error
      } else if (
        typeof destinatarioObj === 'object' &&
        destinatarioObj.id_usuario_puesto
      ) {
        destinatarioIdUsuarioPuesto = destinatarioObj.id_usuario_puesto;
      } else {
        this.alertService.error(
          'Debe seleccionar un destinatario válido de la lista.'
        );
        destinatarioCtrl.markAsTouched();
        this.isSaving = false;
        return;
      }
    }

    if (this.data?.mode === 'status') {
      // Se valida el campo de observaciones y el estado
      const obsCtrl = this.form.get('observaciones');
      const estadoCtrl = this.form.get('ct_correspondencia_estado');
      obsCtrl?.markAsTouched();
      obsCtrl?.updateValueAndValidity();
      estadoCtrl?.markAsTouched();
      estadoCtrl?.updateValueAndValidity();
      if (!obsCtrl?.valid || !estadoCtrl?.valid) {
        this.isSaving = false;
        return;
      }
      // dt_correspondencia_id (id_correspondencia)
      const correspondencia = this.data?.correspondencia;
      const dtCorrespondenciaId = correspondencia?.id_correspondencia;
      if (dtCorrespondenciaId) {
        const updatePayload: any = {
          dt_correspondencia_id: dtCorrespondenciaId,
          observaciones: obsCtrl.value,
          ct_correspondencia_estado: estadoCtrl.value,
        };
        // Lógica para enviar destinatario solo si es estado 4 (returnada)
        if (estado === 4) {
          // Estado 4: id_usuario_puesto_2 es obligatorio (destinatario)
          if (destinatarioIdUsuarioPuesto) {
            updatePayload.id_usuario_puesto_2 = destinatarioIdUsuarioPuesto;
          } else {
            this.alertService.error(
              "Debe seleccionar un destinatario válido para el estado 'Derivación'."
            );
            destinatarioCtrl?.markAsTouched();
            this.isSaving = false;
            return;
          }
        }
        this.correspondenceService
          .editarObservaciones(updatePayload)
          .subscribe({
            next: (response: any) => {
              this.isSaving = false;
              if (response && response.success) {
                this.isSuccess = true;
                this.alertService.success(
                  '¡Observación y estado actualizados correctamente!'
                );
                setTimeout(() => {
                  if (this.data?.onSave) {
                    this.data.onSave();
                  }
                  this.modalService.close();
                }, 2000); // Espera para mostrar la animación de éxito
              } else {
                this.isSuccess = false;
                this.alertService.error(
                  'Ocurrió un error al actualizar observaciones y estado.'
                );
              }
            },
            error: (error: any) => {
              this.isSaving = false;
              this.isSuccess = false;
              this.alertService.error(
                'No se pudo guardar la observación y estado.'
              );
              if (error.error && error.error.message) {
                this.alertService.error(error.error.message);
              }
            },
          });
      } else {
        this.alertService.error(
          'No se encontró el identificador de correspondencia. No es posible guardar la observación y estado.'
        );
        this.isSaving = false;
      }
      return;
    }

    const formData = new FormData();
    formData.append(
      'ct_clasificacion_prioridad_id',
      this.form.get('ct_clasificacion_prioridad_id')?.value
    );
    formData.append(
      'ct_forma_entrega_id',
      this.form.get('ct_forma_entrega_id')?.value
    );
    // Enviar la fecha exactamente como la selecciona el usuario
    let fecha = this.form.get('fecha_correspondencia')?.value || '';
    // Formatear la fecha a 'YYYY-MM-DDT12:00:00' si viene en formato 'YYYY-MM-DD' para el back end
    if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      fecha = `${fecha}T12:00:00`;
    }
    formData.append('fecha_correspondencia', fecha);
    formData.append(
      'folio_correspondencia',
      this.form.get('folio_correspondencia')?.value
    );
    formData.append('resumen_correspondencia', this.form.get('resumen')?.value);

    if (this.selectedFile) {
      // Si hay un archivo seleccionado, se agrega al FormData
      formData.append('ruta_correspondencia', this.selectedFile);
    } else if (
      (this.data?.mode === 'edit' || this.data?.mode === 'editFull') &&
      this.data.correspondencia?.ruta_correspondencia
    ) {
      formData.append(
        'ruta_correspondencia',
        this.data.correspondencia.ruta_correspondencia
      );
    }
    // Recibe del back el id_usuario_puesto del destinatario
    if (estado === 4) {
      if (destinatarioIdUsuarioPuesto) {
        formData.append('id_usuario_puesto_2', destinatarioIdUsuarioPuesto);
      } else {
        this.alertService.error(
          "Debe seleccionar un destinatario válido cuando el estado es 'Returnada'."
        );
        destinatarioCtrl?.markAsTouched();
        this.isSaving = false;
        return;
      }
    } else {
      // Siempre enviar destinatario como id_usuario_puesto_2
      if (destinatarioIdUsuarioPuesto) {
        formData.append('id_usuario_puesto_2', destinatarioIdUsuarioPuesto);
      } else {
        this.alertService.error(
          'Debe seleccionar un destinatario válido de la lista.'
        );
        destinatarioCtrl?.markAsTouched();
        this.isSaving = false;
        return;
      }
    }

    // Enviar remitente como id_usuario_puesto al back end
    if (
      this.form.get('remitente_1') &&
      this.selectedRemitente &&
      this.selectedRemitente.id_usuario_puesto
    ) {
      formData.append(
        'id_usuario_puesto',
        this.selectedRemitente.id_usuario_puesto
      );
    }
    // Si el modo es 'edit', se agrega el id_correspondencia_usuario
    let id_usuario_final = '';
    if (this.data?.currentUser?.user?.id_usuario) {
      id_usuario_final = this.data.currentUser.user.id_usuario;
    } else if (this.data?.currentUser?.user?.ct_usuario_in) {
      id_usuario_final = this.data.currentUser.user.ct_usuario_in;
    } else if (this.data?.id_usuario) {
      id_usuario_final = this.data.id_usuario;
    } else if (this.id_usuario) {
      id_usuario_final = this.id_usuario;
    }
    this.form.get('ct_usuarios_in')?.setValue(id_usuario_final);
    // Se registra el ID de usuario que se enviará.
    // console.log('ct_usuarios_in a enviar:', id_usuario_final);
    formData.append('ct_usuarios_in', this.form.get('ct_usuarios_in')?.value);

    // Itera sobre el FormData para mostrar los valores que se enviarán, útil para depuración.
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ':', pair[1]);
    // }

    // Si no hay archivo nuevo, no se envia
    if (
      this.data?.mode === 'editFull' &&
      this.data.correspondencia?.id_correspondencia
    ) {
      // Agregar id_correspondencia al FormData
      formData.append(
        'id_correspondencia',
        this.data.correspondencia.id_correspondencia
      );
      this.correspondenceService.editCorrespondenceFull(formData).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          if (
            response &&
            (response.id_correspondencia ||
              response.folio_sistema ||
              response.success)
          ) {
            this.isSuccess = true;
            this.alertService.success(
              '¡Correspondencia actualizada correctamente!'
            );
            setTimeout(() => {
              if (this.data?.onSave) {
                this.data.onSave();
              }
              this.modalService.close();
            }, 2000); // Espera para mostrar la animación de éxito
          } else {
            this.isSuccess = false;
            this.alertService.error('Ocurrió un error al actualizar.');
          }
        },
        error: (error: any) => {
          this.isSaving = false;
          this.isSuccess = false;
          this.alertService.error('No se pudo actualizar la correspondencia.');
          if (error.error && error.error.message) {
            this.alertService.error(error.error.message);
          }
        },
      });
    } else if (
      this.data?.mode === 'edit' &&
      this.data.correspondencia?.id_correspondencia
    ) {
      this.correspondenceService.updateCorrespondence(formData).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          // Muestra el mensaje si la respuesta tiene un id o folio, o success true
          if (
            response &&
            (response.id_correspondencia ||
              response.folio_sistema ||
              response.success)
          ) {
            this.isSuccess = true;
            this.alertService.success(
              '¡Correspondencia actualizada correctamente!'
            );
            setTimeout(() => {
              if (this.data?.onSave) {
                this.data.onSave();
              }
              this.modalService.close();
            }, 2000); // Espera para mostrar la animación de éxito
          } else {
            this.isSuccess = false;
            this.alertService.error('Ocurrió un error al actualizar.');
          }
        },
        error: (error: any) => {
          this.isSaving = false;
          this.isSuccess = false;
          this.alertService.error('No se pudo actualizar la correspondencia.');
          if (error.error && error.error.message) {
            this.alertService.error(error.error.message);
          }
        },
      });
    } else {
      const isEditMode =
        this.data?.mode === 'edit' || this.data?.mode === 'editFull';
      const peticion =
        this.data.mode === 'edit'
          ? this.correspondenceService.editCorrespondenceFull(formData)
          : this.correspondenceService.createCorrespondence(formData);

      peticion.subscribe({
        next: (response: any) => {
          this.isSaving = false;
          if (response && (response.success || response.id_correspondencia)) {
            this.isSuccess = true;
            this.alertService.success(
              `¡Correspondencia ${
                isEditMode ? 'editada' : 'agregada'
              } correctamente!`
            );
            setTimeout(() => {
              if (this.data?.onSave) {
                this.data.onSave();
              }
              this.modalService.close();
            }, 2000); // Espera para mostrar la animación de éxito
          } else {
            this.isSuccess = false;
            this.alertService.error(
              `Ocurrió un error al ${
                isEditMode ? 'editar' : 'agregar'
              } la correspondencia.`
            );
          }
        },
        error: (error: any) => {
          this.isSaving = false;
          this.isSuccess = false;
          this.alertService.error('No se pudo guardar la correspondencia.');
          if (error.error && error.error.message) {
            this.alertService.error(error.error.message);
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.docClickListener) {
      document.removeEventListener('click', this.docClickListener, true);
    }
  }

  onOptionPointerDown(
    ev: Event,
    item: any,
    tipo: 'destinatario' | 'remitente'
  ) {
    ev.preventDefault();
    ev.stopPropagation();
    this.lastPointerSelection = true;
    const controlName =
      tipo === 'destinatario' ? 'destinatario_1' : 'remitente_1';
    const control = this.form.get(controlName);
    control?.setValue(item);

    const label: string =
      item?.nombreCompleto ||
      [
        item?.informacion?.nombre,
        item?.informacion?.apellido_paterno,
        item?.informacion?.apellido_materno,
      ]
        .filter(Boolean)
        .join(' ');
    try {
      const inputEl: HTMLInputElement | null = document.querySelector(
        `input#${controlName}`
      );
      if (inputEl) inputEl.value = label || '';
    } catch {}

    if (tipo === 'destinatario') this.filteredDestinatarios = [];
    else this.filteredRemitentes = [];

    this.phantomClickBlockUntil = Date.now() + 450;

    try {
      const inputBlur: HTMLInputElement | null = document.querySelector(
        `input#${controlName}`
      );
      inputBlur?.blur();
    } catch {}

    setTimeout(() => {
      const nextId = this.resolveNextFieldId(tipo);
      if (nextId) {
        const nextEl = document.getElementById(nextId) as
          | HTMLInputElement
          | HTMLSelectElement
          | null;
        nextEl?.focus();
      }
    }, 35);
  }

  onInputBlur(tipo: 'destinatario' | 'remitente') {
    if (this.pendingCloseTimer) clearTimeout(this.pendingCloseTimer);
    this.pendingCloseTimer = setTimeout(() => {
      if (!this.lastPointerSelection) {
        if (tipo === 'destinatario') this.filteredDestinatarios = [];
        else this.filteredRemitentes = [];
      }
      this.lastPointerSelection = false;
    }, 80);
  }

  private resolveNextFieldId(
    tipo: 'destinatario' | 'remitente'
  ): string | null {
    if (tipo === 'destinatario') {
      const exists = document.getElementById('remitente_1');
      if (exists) return 'remitente_1';
    } else {
      if (this.data?.mode !== 'status') {
        const prio = document.getElementById('ct_clasificacion_prioridad_id');
        if (prio) return 'ct_clasificacion_prioridad_id';
      }
    }
    return null;
  }

  // Muestra el PDF de correspondencia en el modal reutilizable
  verPdfCorrespondencia(nombreArchivo: string) {
    if (!nombreArchivo) {
      this.alertService.error(
        'No hay archivo de correspondencia para mostrar.'
      );
      return;
    }
    this.correspondenceService
      .getCorrespondenceDocument(nombreArchivo)
      .subscribe({
        next: (blob: Blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const safeUrl =
            (window as any).ng &&
            (window as any).ng.core &&
            (window as any).ng.core.DomSanitizer
              ? (
                  window as any
                ).ng.core.DomSanitizer.bypassSecurityTrustResourceUrl(blobUrl)
              : blobUrl;
          this.modalService.open(
            undefined,
            `Documento de correspondencia ${nombreArchivo}`,
            undefined,
            undefined,
            safeUrl
          );
        },
        error: () => {
          this.alertService.error(
            'No se pudo obtener el PDF de correspondencia.'
          );
        },
      });
  }

  displayWithNombreArea = (item: any): string => {
    if (!item) return '';
    const nombre = item.nombreCompleto || '';
    const area = item.area || item.nombre_area || '';
    return area ? `${nombre} — ${area}` : nombre;
  };
}
