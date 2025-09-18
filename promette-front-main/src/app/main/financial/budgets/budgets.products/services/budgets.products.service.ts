import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import {
  Area,
  ConsumableProduct,
  Item,
  CreateRequisitionRequest,
  CreateProyectoAnualRequest,
  UpdateProyectoAnualRequest,
  RequisitionResponse,
  ProyectoAnualResponse,
  JustificacionPartida,
} from '../../interfaces/budgets.interface';

export interface ProductsByItemResponse {
  success: boolean;
  msg?: string;
  products?: ConsumableProduct[];
  total?: number;
  isExpectedError?: boolean;
  errorType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetsProductsService {
  private readonly apiBaseUrl = environment.apiUrlPromette;

  constructor(private http: HttpClient) {}

  getAllAreas(): Observable<Area[]> {
    console.log('🔍 Cargando áreas desde administrativeUnits...');

    return this.http
      .get<{ administrativeUnits: any[] }>(
        `${this.apiBaseUrl}/administrativeUnits`
      )
      .pipe(
        map((response) => {
          console.log('📋 Respuesta de administrativeUnits:', response);

          if (!response.administrativeUnits) {
            console.warn(
              '⚠️ No se encontraron administrativeUnits en la respuesta'
            );
            return [];
          }

          // ✅ MAPEAR CORRECTAMENTE: id_area_fin como primary key funcional
          const areas: Area[] = response.administrativeUnits.map((unit) => ({
            id_area: unit.id_area_fin, // ✅ USAR id_area_fin como id_area funcional
            id_area_fin: unit.id_area_fin, // ✅ PRIMARY KEY de rl_area_financiero
            id_financiero: unit.id_financiero, // ✅ INFORMATIVO
            id_area_infra: unit.id_area_infra, // ✅ VINCULACIÓN con API externa
            nombre_area: unit.nombre, // ✅ Nombre correcto de la API de infraestructura
            nombre: unit.nombre, // Alias para compatibilidad
            estado: 1, // Activo por defecto
          }));

          console.log('✅ Áreas mapeadas correctamente:', areas.length);
          console.log('Ejemplo de área:', areas[0]);

          return areas;
        }),
        catchError((error) => {
          console.error('❌ Error al cargar áreas administrativas:', error);
          return throwError(
            () => new Error('Error al cargar áreas administrativas')
          );
        })
      );
  }

  /**
   * Detecta el área financiera correcta desde un techo presupuestal
   */
  getAreaFinancieraFromTecho(
    techoId: number
  ): Observable<{ id_area_fin: number; nombre: string } | null> {
    console.log(`🔍 Detectando área financiera para techo ID: ${techoId}`);

    return this.http
      .get<any>(
        `${this.apiBaseUrl}/anualProject/by-techo/${techoId}?single=true`
      )
      .pipe(
        map((response) => {
          console.log('📋 Respuesta completa del techo:', response);

          if (response?.success) {
            // ✅ PRIORIDAD 1: Usar area_financiera directa si existe
            if (response.area_financiera?.id_area_fin) {
              console.log(
                '✅ Área detectada desde area_financiera:',
                response.area_financiera
              );
              return {
                id_area_fin: response.area_financiera.id_area_fin,
                nombre: response.area_financiera.nombre,
              };
            }

            // ✅ PRIORIDAD 2: Usar información del techo si existe
            if (response.techo?.ct_area?.id_area_fin) {
              console.log(
                '✅ Área detectada desde techo.ct_area:',
                response.techo.ct_area
              );
              return {
                id_area_fin: response.techo.ct_area.id_area_fin,
                nombre: `Área Financiera ${response.techo.ct_area.id_area_fin}`,
              };
            }

            // ✅ PRIORIDAD 3: Usar información del proyecto si existe
            if (response.project?.dt_techo?.ct_area?.id_area_fin) {
              console.log(
                '✅ Área detectada desde proyecto:',
                response.project.dt_techo.ct_area
              );
              return {
                id_area_fin: response.project.dt_techo.ct_area.id_area_fin,
                nombre: `Área Financiera ${response.project.dt_techo.ct_area.id_area_fin}`,
              };
            }
          }

          console.error(
            '❌ No se encontró área financiera en ninguna ubicación'
          );
          console.error('Estructura recibida:', {
            success: response?.success,
            has_area_financiera: !!response?.area_financiera,
            has_techo: !!response?.techo,
            has_project: !!response?.project,
          });

          return null;
        }),
        catchError((error) => {
          console.error(
            '❌ Error al detectar área financiera desde techo:',
            error
          );
          return throwError(
            () =>
              new Error(
                `Error al detectar área financiera: ${error.message || error}`
              )
          );
        })
      );
  }

  /**
   * PASO 2: Obtiene productos por partida (con manejo de endpoint pendiente)
   */
  getProductsByItem(itemId: number): Observable<ProductsByItemResponse> {
    console.log(`🔍 PASO 2: Solicitando productos para partida ID: ${itemId}`);

    return this.http
      .get<{ success: boolean; products: ConsumableProduct[]; total: number }>(
        `${this.apiBaseUrl}/consumableProduct/item/${itemId}`
      )
      .pipe(
        map((response) => {
          console.log(
            `✅ PASO 2: Respuesta exitosa para partida ${itemId}:`,
            response
          );

          return {
            success: response.success,
            products: response.products || [],
            total: response.total || 0,
            msg: `${response.products?.length || 0} productos encontrados`,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.log(
            `🔧 PASO 2: Manejando error para partida ${itemId}:`,
            error.status
          );

          // Manejar endpoint no implementado (404)
          if (error.status === 404) {
            console.log(
              'ℹ️ PASO 2: Endpoint pendiente de implementación - Estado normal durante desarrollo'
            );

            return of({
              success: false,
              products: [],
              total: 0,
              msg: 'Endpoint en desarrollo',
              isExpectedError: true,
              errorType: 'ENDPOINT_NOT_IMPLEMENTED',
            });
          }

          // Manejar errores de conexión
          if (error.status === 0 || error.status >= 500) {
            return of({
              success: false,
              products: [],
              total: 0,
              msg: 'Error de conexión al servidor',
              isExpectedError: false,
              errorType: 'CONNECTION_ERROR',
            });
          }

          // Error genérico
          return of({
            success: false,
            products: [],
            total: 0,
            msg: error.error?.msg || 'Error al cargar productos',
            isExpectedError: false,
            errorType: 'GENERIC_ERROR',
          });
        })
      );
  }
  //Regla de restricción
  getProductsRestrictedByItem(areaId:number, itemId: number): Observable<ProductsByItemResponse> {
    console.log(`🔍 PASO 2: Solicitando productos para partida ID: ${itemId}`);

    return this.http
      .get<{ success: boolean; products: ConsumableProduct[]; total: number }>(
        `${this.apiBaseUrl}/consumableProduct/itemRestricted/${areaId}/${itemId}`
      )
      .pipe(
        map((response) => {
          console.log(
            `✅ PASO 2: Respuesta exitosa para partida ${itemId}:`,
            response
          );

          return {
            success: response.success,
            products: response.products || [],
            total: response.total || 0,
            msg: `${response.products?.length || 0} productos encontrados`,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.log(
            `🔧 PASO 2: Manejando error para partida ${itemId}:`,
            error.status
          );

          // Manejar endpoint no implementado (404)
          if (error.status === 404) {
            console.log(
              'ℹ️ PASO 2: Endpoint pendiente de implementación - Estado normal durante desarrollo'
            );

            return of({
              success: false,
              products: [],
              total: 0,
              msg: 'Endpoint en desarrollo',
              isExpectedError: true,
              errorType: 'ENDPOINT_NOT_IMPLEMENTED',
            });
          }

          // Manejar errores de conexión
          if (error.status === 0 || error.status >= 500) {
            return of({
              success: false,
              products: [],
              total: 0,
              msg: 'Error de conexión al servidor',
              isExpectedError: false,
              errorType: 'CONNECTION_ERROR',
            });
          }

          // Error genérico
          return of({
            success: false,
            products: [],
            total: 0,
            msg: error.error?.msg || 'Error al cargar productos',
            isExpectedError: false,
            errorType: 'GENERIC_ERROR',
          });
        })
      );
  }

  createUnifiedRequisitions(
    request: CreateRequisitionRequest
  ): Observable<RequisitionResponse> {
    console.log('🚀 INICIANDO CREACIÓN UNIFICADA DE REQUISICIONES');
    console.log('📋 Request recibido:', request);

    // ✅ VALIDACIÓN CRÍTICA ESTRICTA: Verificar que ct_area_id sea id_area_fin válido
    if (!request.ct_area_id || request.ct_area_id <= 0) {
      console.error(
        '❌ ct_area_id inválido en el request:',
        request.ct_area_id
      );
      return throwError(
        () =>
          new Error(
            `ID de área financiera inválido (${request.ct_area_id}). El sistema no puede procesar requisiciones sin un área válida.`
          )
      );
    }

    console.log(
      `✅ Área financiera recibida: ID=${request.ct_area_id} (debe ser id_area_fin válido)`
    );

    // ✅ VALIDACIÓN ADICIONAL: Verificar que el área existe antes de enviar
    return this.validateAreaFinanciera(request.ct_area_id).pipe(
      switchMap((isValid) => {
        if (!isValid) {
          console.error(
            `❌ Área financiera ${request.ct_area_id} no es válida o no existe`
          );
          return throwError(
            () =>
              new Error(
                `El área financiera ${request.ct_area_id} no existe en el sistema. ` +
                  'Contacte al administrador para verificar la configuración.'
              )
          );
        }

        // ✅ CONTINUAR CON LA CREACIÓN SOLO SI EL ÁREA ES VÁLIDA
        const productosParaBackend = request.selectedProducts.map(
          (selectedProduct) => ({
            ct_productos_id: selectedProduct.product.id_producto,
            meses: selectedProduct.monthlyQuantities.map((month) => ({
              mes: month.mes,
              cantidad: month.cantidad,
            })),
          })
        );

        const requisicionesData = {
          dt_techo_id: request.dt_techo_id,
          ct_area_id: request.ct_area_id,
          ct_usuario_id: request.ct_usuario_id,
          justificacion: request.justificacion,
          descripcion: request.descripcion,
          productos: productosParaBackend,
        };

        console.log('🎯 DATOS VALIDADOS PARA BACKEND:');
        console.log('   - dt_techo_id:', requisicionesData.dt_techo_id);
        console.log(
          '   - ct_area_id (VALIDADO):',
          requisicionesData.ct_area_id
        );
        console.log('   - ct_usuario_id:', requisicionesData.ct_usuario_id);
        console.log('   - productos:', requisicionesData.productos.length);

        return this.http.post<RequisitionResponse>(
          `${this.apiBaseUrl}/requisition/create`,
          requisicionesData
        );
      }),
      tap((response) => {
        console.log('✅ Respuesta exitosa del backend:', response);
        console.log(`📊 Requisiciones creadas: ${response.requisiciones}`);
      }),
      catchError((error) => {
        console.error('❌ Error al crear requisiciones unificadas:', error);

        let errorMessage = 'Error al crear requisiciones';

        if (error.error?.msg) {
          errorMessage = error.error.msg;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Añadir contexto específico sobre el área financiera
        if (error.status === 400 && errorMessage.includes('área')) {
          errorMessage += ` (ID área financiera: ${request.ct_area_id})`;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * ✅ OBTENER PROYECTO ANUAL: Por área financiera (usando id_area_fin)
   */
  getProyectoAnualByArea(areaFinId: number): Observable<ProyectoAnualResponse> {
    console.log(
      `🔍 Obteniendo proyecto anual para área financiera ID: ${areaFinId}`
    );

    return this.http
      .get<ProyectoAnualResponse>(
        `${this.apiBaseUrl}/anualProject/area/${areaFinId}`
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            console.log('✅ Proyecto anual encontrado para área:', areaFinId);
          } else {
            console.log('ℹ️ No existe proyecto anual para área:', areaFinId);
          }
        }),
        catchError((error) => {
          console.error(
            `❌ Error al obtener proyecto anual para área ${areaFinId}:`,
            error
          );
          return throwError(() => error);
        })
      );
  }

  /**
   * ✅ MEJORAR: Obtener proyecto anual por techo presupuestal con mejor detección
   */
  getProyectoAnualByTechoId(
    techoId: number
  ): Observable<ProyectoAnualResponse> {
    console.log(`🔍 Obteniendo proyecto anual para techo ID: ${techoId}`);

    return this.http
      .get<any>(`${this.apiBaseUrl}/anualProject/by-techo/${techoId}`)
      .pipe(
        map((response) => {
          console.log('📊 Respuesta completa del endpoint by-techo:', response);

          if (
            response?.success &&
            response?.projects &&
            response.projects.length > 0
          ) {
            const project = response.projects[0];
            console.log('✅ Proyecto anual encontrado:', project);

            // ✅ EXTRAER MONTO DEL TECHO PRESUPUESTAL SI NO ESTÁ EN EL PROYECTO
            let montoAsignado = project.monto_asignado;

            if (!montoAsignado && project.dt_techo?.monto_asignado) {
              montoAsignado = project.dt_techo.monto_asignado;
              console.log(`💰 Monto tomado del techo: ${montoAsignado}`);
            }

            return {
              success: true,
              project: {
                ...project,
                monto_asignado: montoAsignado || 0,
                monto_utilizado: project.monto_utilizado || 0,
                monto_disponible:
                  (montoAsignado || 0) - (project.monto_utilizado || 0),
              },
              msg: 'Proyecto anual encontrado', // Added required msg property
            };
          }

          // ✅ RESPUESTA CONSISTENTE CUANDO NO EXISTE
          console.log('ℹ️ No se encontró proyecto anual para el techo');
          return {
            success: false,
            project: undefined,
            msg: 'No existe proyecto anual para este techo',
          };
        }),
        catchError((error) => {
          console.error(
            `❌ Error al obtener proyecto anual para techo ${techoId}:`,
            error
          );

          // ✅ MANEJAR DIFERENTES TIPOS DE ERROR
          if (error.status === 404) {
            return of({
              success: false,
              project: undefined,
              msg: 'Proyecto anual no encontrado',
            });
          }

          return throwError(
            () => new Error(`Error al obtener proyecto anual: ${error.message}`)
          );
        })
      );
  }

  /**
   * ✅ MEJORAR: Asegurar proyecto anual con mejor detección de monto del techo
   */
  ensureProyectoAnualExists(techoId: number): Observable<any> {
    console.log(
      `🔧 Asegurando existencia de proyecto anual para techo: ${techoId}`
    );

    // ✅ PRIMERO OBTENER INFORMACIÓN COMPLETA DEL TECHO
    return this.http
      .get<any>(`${this.apiBaseUrl}/budgetCeiling/${techoId}`)
      .pipe(
        switchMap((techoResponse) => {
          console.log('📊 Información del techo presupuestal:', techoResponse);

          let montoAsignado = 0;
          let areaId = null;

          if (techoResponse?.success && techoResponse?.ceiling) {
            montoAsignado = Number(techoResponse.ceiling.monto_asignado) || 0;
            areaId = techoResponse.ceiling.ct_area_id;

            console.log(`💰 Monto del techo: ${montoAsignado}`);
            console.log(`📍 Área del techo: ${areaId}`);
          }

          // ✅ DETECTAR ÁREA FINANCIERA
          return this.getAreaFinancieraFromTecho(techoId).pipe(
            switchMap((areaInfo) => {
              if (!areaInfo) {
                throw new Error(
                  'No se pudo detectar área financiera para el techo presupuestal'
                );
              }

              console.log(
                `🎯 Área detectada para proyecto anual: ${areaInfo.id_area_fin}`
              );

              const createData: CreateProyectoAnualRequest = {
                año: new Date().getFullYear(),
                dt_techo_id: techoId,
                descripcion: `Proyecto anual para ${areaInfo.nombre}`,
                monto_asignado: montoAsignado, // ✅ INCLUIR MONTO DEL TECHO
              };

              return this.http
                .post<any>(`${this.apiBaseUrl}/anualProject/ensure`, createData)
                .pipe(
                  map((response) => {
                    console.log(
                      '✅ Proyecto anual asegurado con monto:',
                      response
                    );

                    // ✅ ASEGURAR QUE EL PROYECTO TENGA EL MONTO CORRECTO
                    if (
                      response &&
                      !response.monto_asignado &&
                      montoAsignado > 0
                    ) {
                      response.monto_asignado = montoAsignado;
                    }

                    return response;
                  })
                );
            })
          );
        }),
        catchError((error) => {
          console.error('❌ Error al asegurar proyecto anual:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar descripción del proyecto anual
   */
  updateProyectoDescripcion(
    projectId: number,
    descripcion: string
  ): Observable<any> {
    const updateData: UpdateProyectoAnualRequest = {
      id_proyecto_anual: projectId,
      descripcion: descripcion,
    };

    return this.http
      .put<any>(`${this.apiBaseUrl}/anualProject/${projectId}`, updateData)
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar descripción del proyecto:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * ✅ JUSTIFICACIONES: Por partida y área financiera con soporte para techo_id opcional
   */
  getJustificacionByPartidaAndArea(
    partidaId: number,
    areaFinId: number,
    techoId?: number
  ): Observable<JustificacionPartida | null> {
    let url = `${this.apiBaseUrl}/justificacion/partida/${partidaId}/area/${areaFinId}`;

    // ✅ MEJORA: Agregar techo_id como query param si se proporciona
    if (techoId) {
      url += `?techo_id=${techoId}`;
    }

    console.log(
      `🔍 Buscando justificación: partida=${partidaId}, área=${areaFinId}, techo=${
        techoId || 'N/A'
      }`
    );

    return this.http
      .get<{ success: boolean; justificacion: JustificacionPartida }>(url)
      .pipe(
        map((response) => {
          if (response.success && response.justificacion) {
            console.log('✅ Justificación encontrada:', response.justificacion);
            return response.justificacion;
          }
          return null;
        }),
        catchError((error) => {
          if (error.status === 404) {
            console.log(
              `ℹ️ No se encontró justificación para partida ${partidaId} y área ${areaFinId}`
            );
          } else {
            console.error('❌ Error al buscar justificación:', error);
          }
          return of(null);
        })
      );
  }

  /**
   * ✅ MÉTODO PRINCIPAL: Crear o actualizar justificación usando upsert
   */
  upsertJustificacion(justificacionData: {
    ct_partida_id: number;
    ct_area_id: number;
    dt_techo_id?: number;
    justificacion: string;
    ct_usuario_id: number;
  }): Observable<any> {
    console.log(
      '🔄 SERVICIO: Upsert justificación con datos:',
      justificacionData
    );

    return this.http
      .post<any>(`${this.apiBaseUrl}/justificacion/upsert`, justificacionData)
      .pipe(
        tap((response) => {
          const accion = response.created ? 'creada' : 'actualizada';
          console.log(
            `✅ SERVICIO: Justificación ${accion} exitosamente:`,
            response
          );
        }),
        catchError((error) => {
          console.error('❌ SERVICIO: Error en upsert justificación:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * ✅ MÉTODO UNIFICADO: Crear justificación (usa upsert internamente)
   */
  createJustificacion(justificacionData: {
    ct_partida_id: number;
    ct_area_id: number;
    dt_techo_id: number;
    justificacion: string;
    ct_usuario_id: number;
  }): Observable<any> {
    console.log('📝 SERVICIO: Delegando a upsert para mayor confiabilidad');
    return this.upsertJustificacion(justificacionData);
  }

  /**
   * ✅ VALIDAR EXISTENCIA: Verificar que una justificación existe
   */
  validateJustificacionExists(
    partidaId: number,
    areaFinId: number,
    techoId?: number
  ): Observable<boolean> {
    return this.getJustificacionByPartidaAndArea(
      partidaId,
      areaFinId,
      techoId
    ).pipe(
      map((justificacion) => !!justificacion),
      catchError(() => of(false))
    );
  }

  /**
   * ✅ LOTE: Crear múltiples justificaciones
   */
  createMultipleJustificaciones(
    justificaciones: Array<{
      ct_partida_id: number;
      ct_area_id: number;
      dt_techo_id?: number;
      justificacion: string;
      ct_usuario_id: number;
    }>
  ): Observable<any[]> {
    console.log(
      `📝 SERVICIO: Creando ${justificaciones.length} justificaciones en lote`
    );

    const requests = justificaciones.map((justif) =>
      this.upsertJustificacion(justif).pipe(
        catchError((error) => {
          console.error(
            `❌ Error en justificación para partida ${justif.ct_partida_id}:`,
            error
          );
          return of({ success: false, error: error.message });
        })
      )
    );

    return forkJoin(requests).pipe(
      tap((results: any[]) => {
        const successful = results.filter((r: any) => r.success).length;
        const failed = results.length - successful;
        console.log(
          `📊 SERVICIO: Justificaciones procesadas - Exitosas: ${successful}, Fallidas: ${failed}`
        );
      })
    );
  }

  // ✅ MÉTODOS AUXILIARES

  /**
   * Genera un ID temporal único para productos en la lista
   */
  generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene nombres de meses en español
   */
  getMonthNames(): string[] {
    return [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
  }

  /**
   * ✅ MÉTODO DE VALIDACIÓN: Verifica que un área financiera sea válida
   */
  validateAreaFinanciera(areaFinId: number): Observable<boolean> {
    return this.getAllAreas().pipe(
      map((areas) => {
        const areaExists = areas.some((area) => area.id_area_fin === areaFinId);

        if (!areaExists) {
          console.error(`❌ Área financiera ${areaFinId} no es válida`);
          console.log(
            'Áreas válidas:',
            areas.map((a) => ({
              id_area_fin: a.id_area_fin,
              nombre: a.nombre_area,
            }))
          );
        } else {
          console.log(`✅ Área financiera ${areaFinId} validada correctamente`);
        }

        return areaExists;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * ✅ MÉTODO DE DEBUG: Para verificar la consistencia de IDs
   */
  debugAreaConsistency(techoId: number): Observable<any> {
    return this.getAreaFinancieraFromTecho(techoId).pipe(
      map((areaInfo) => {
        console.log('=== DEBUG CONSISTENCIA DE ÁREA ===');
        console.log('Techo ID:', techoId);
        console.log('Área detectada:', areaInfo);

        if (areaInfo) {
          return this.validateAreaFinanciera(areaInfo.id_area_fin).pipe(
            map((isValid) => ({
              techoId,
              areaFinId: areaInfo.id_area_fin,
              areaName: areaInfo.nombre,
              isValid,
              status: isValid ? 'VÁLIDA' : 'INVÁLIDA',
            }))
          );
        }

        return of({
          techoId,
          areaFinId: null,
          areaName: null,
          isValid: false,
          status: 'NO_DETECTADA',
        });
      })
    );
  }

  /**
   *  Obtiene partidas filtradas por capítulo
   */
  getItemsFilteredByChapter(chapterKey: number): Observable<Item[]> {
    return this.http.get<any>(`${this.apiBaseUrl}/item/with-products`).pipe(
      map((response) => {
        console.log(
          `🔍 Aplicando filtro de capítulo ${chapterKey} en el servicio`
        );

        if (!response?.success || !response?.items) {
          console.warn('⚠️ No se recibieron partidas válidas del backend');
          return [];
        }

        const allItems = response.items;
        console.log(`📋 Total de partidas recibidas: ${allItems.length}`);

        // ✅ APLICAR FILTRO POR CAPÍTULO EN EL SERVICIO
        const filteredItems = this.filterItemsByChapter(allItems, chapterKey);

        console.log(
          `🎯 Partidas filtradas para capítulo ${chapterKey}: ${filteredItems.length}`
        );

        return filteredItems;
      }),
      catchError((error) => {
        console.error('❌ Error al cargar partidas filtradas:', error);
        return this.handleItemsError(error);
      })
    );
  }

  /**
   * ✅ NUEVO: Lógica de filtrado por capítulo
   */
  private filterItemsByChapter(items: Item[], chapterKey: number): Item[] {
    if (!chapterKey || !items || items.length === 0) {
      console.log('❌ No se puede aplicar filtro: parámetros inválidos');
      console.log(`   chapterKey: ${chapterKey}`);
      console.log(`   items: ${items ? items.length : 'null'}`);
      return items;
    }

    // Determinar el rango según el capítulo
    const rangoMinimo = chapterKey;
    const rangoMaximo = chapterKey + 9999;

    console.log(`🔍 INICIANDO FILTRO:`);
    console.log(`   Capítulo: ${chapterKey}`);
    console.log(`   Rango: ${rangoMinimo} - ${rangoMaximo}`);
    console.log(`   Total items a filtrar: ${items.length}`);

    const partidasFiltradas = items.filter((partida, index) => {
      const clavePartida = Number(partida.clave_partida);

      if (isNaN(clavePartida)) {
        console.warn(
          `⚠️ Clave de partida inválida en índice ${index}: ${partida.clave_partida}`
        );
        return false;
      }

      const enRango =
        clavePartida >= rangoMinimo && clavePartida <= rangoMaximo;

      // Log solo las primeras 10 partidas para no saturar la consola
      if (index < 10) {
        console.log(
          `   ${enRango ? '✅' : '❌'} Partida ${partida.clave_partida} - ${
            partida.nombre_partida
          } (${enRango ? 'INCLUIDA' : 'EXCLUIDA'})`
        );
      } else if (index === 10) {
        console.log(
          `   ... (ocultando logs del resto de partidas para evitar saturación)`
        );
      }

      return enRango;
    });

    console.log(`📊 RESULTADO FINAL DEL FILTRO:`);
    console.log(`   Partidas originales: ${items.length}`);
    console.log(`   Partidas filtradas: ${partidasFiltradas.length}`);
    console.log(
      `   Porcentaje filtrado: ${(
        (partidasFiltradas.length / items.length) *
        100
      ).toFixed(1)}%`
    );

    // Mostrar las primeras partidas filtradas
    if (partidasFiltradas.length > 0) {
      console.log(`🔍 Primeras partidas filtradas:`);
      partidasFiltradas.slice(0, 5).forEach((partida, index) => {
        console.log(
          `   ${index + 1}. ${partida.clave_partida} - ${
            partida.nombre_partida
          }`
        );
      });
      if (partidasFiltradas.length > 5) {
        console.log(`   ... y ${partidasFiltradas.length - 5} más`);
      }
    }

    return partidasFiltradas;
  }

  getItemsRestricted(idArea: number, chapterFilter?: number): Observable<Item[]> {
    console.log(
      `📋 getAllItems llamado con filtro de capítulo: ${
        chapterFilter || 'ninguno'
      } del área ${idArea}`
    );
    console.log(`📋 Tipo del filtro: ${typeof chapterFilter}`);
    console.log(
      `📋 ¿Filtro es válido?: ${
        chapterFilter && chapterFilter > 0 ? 'SÍ' : 'NO'
      }`
    );

    return this.http.get<any>(`${this.apiBaseUrl}/item/with-products-restricted/${idArea}`).pipe(
      map((response) => {
        if (!response?.success || !response?.items) {
          console.warn('⚠️ No se recibieron partidas válidas del backend');
          return [];
        }

        const allItems = response.items;
        console.log(
          `📋 Total de partidas recibidas del backend: ${allItems.length}`
        );

        // ✅ VERIFICAR Y APLICAR FILTRO SOLO SI ES VÁLIDO
        if (
          chapterFilter &&
          chapterFilter > 0 &&
          this.isValidChapterKey(chapterFilter)
        ) {
          console.log(
            `🔍 APLICANDO FILTRO DE CAPÍTULO ${chapterFilter} EN EL SERVICIO`
          );

          const filteredItems = this.filterItemsByChapter(
            allItems,
            chapterFilter
          );
          console.log(
            `🎯 RESULTADO: ${filteredItems.length} partidas filtradas para capítulo ${chapterFilter}`
          );

          return filteredItems;
        } else {
          // Logging detallado de por qué no se aplica filtro
          if (!chapterFilter) {
            console.log(
              `📋 Sin filtro aplicado: chapterFilter es ${chapterFilter}`
            );
          } else if (chapterFilter <= 0) {
            console.log(
              `📋 Sin filtro aplicado: chapterFilter no es válido (${chapterFilter})`
            );
          } else if (!this.isValidChapterKey(chapterFilter)) {
            console.log(
              `📋 Sin filtro aplicado: chapterFilter no está en lista válida (${chapterFilter})`
            );
          }

          console.log(`📋 Devolviendo todas las partidas: ${allItems.length}`);
          return allItems;
        }
      }),
      catchError((error) => {
        console.error('❌ Error al cargar partidas:', error);
        return this.handleItemsError(error);
      })
    );
  }

  /**
   * ✅ MEJORAR: Método getAllItems ahora con soporte para filtro opcional
   */
  getAllItems(chapterFilter?: number): Observable<Item[]> {
    console.log(
      `📋 getAllItems llamado con filtro de capítulo: ${
        chapterFilter || 'ninguno'
      }`
    );
    console.log(`📋 Tipo del filtro: ${typeof chapterFilter}`);
    console.log(
      `📋 ¿Filtro es válido?: ${
        chapterFilter && chapterFilter > 0 ? 'SÍ' : 'NO'
      }`
    );

    return this.http.get<any>(`${this.apiBaseUrl}/item/with-products`).pipe(
      map((response) => {
        if (!response?.success || !response?.items) {
          console.warn('⚠️ No se recibieron partidas válidas del backend');
          return [];
        }

        const allItems = response.items;
        console.log(
          `📋 Total de partidas recibidas del backend: ${allItems.length}`
        );

        // ✅ VERIFICAR Y APLICAR FILTRO SOLO SI ES VÁLIDO
        if (
          chapterFilter &&
          chapterFilter > 0 &&
          this.isValidChapterKey(chapterFilter)
        ) {
          console.log(
            `🔍 APLICANDO FILTRO DE CAPÍTULO ${chapterFilter} EN EL SERVICIO`
          );

          const filteredItems = this.filterItemsByChapter(
            allItems,
            chapterFilter
          );
          console.log(
            `🎯 RESULTADO: ${filteredItems.length} partidas filtradas para capítulo ${chapterFilter}`
          );

          return filteredItems;
        } else {
          // Logging detallado de por qué no se aplica filtro
          if (!chapterFilter) {
            console.log(
              `📋 Sin filtro aplicado: chapterFilter es ${chapterFilter}`
            );
          } else if (chapterFilter <= 0) {
            console.log(
              `📋 Sin filtro aplicado: chapterFilter no es válido (${chapterFilter})`
            );
          } else if (!this.isValidChapterKey(chapterFilter)) {
            console.log(
              `📋 Sin filtro aplicado: chapterFilter no está en lista válida (${chapterFilter})`
            );
          }

          console.log(`📋 Devolviendo todas las partidas: ${allItems.length}`);
          return allItems;
        }
      }),
      catchError((error) => {
        console.error('❌ Error al cargar partidas:', error);
        return this.handleItemsError(error);
      })
    );
  }

  /**
   * ✅ NUEVO: Método para obtener información del capítulo desde el techo presupuestal
   */
  getChapterFromBudgetCeiling(
    budgetCeilingId: number
  ): Observable<{ chapterKey: number; chapterName: string } | null> {
    return this.http
      .get<any>(`${this.apiBaseUrl}/budgetCeiling/${budgetCeilingId}`)
      .pipe(
        map((response) => {
          if (!response?.success || !response?.ceiling) {
            console.warn(
              '⚠️ No se pudo obtener información del techo presupuestal'
            );
            return null;
          }

          const ceiling = response.ceiling;
          const chapterKey = ceiling.ct_capitulo?.clave_capitulo;
          const chapterName = ceiling.ct_capitulo?.nombre_capitulo;

          if (!chapterKey) {
            console.warn(
              '⚠️ No se encontró clave de capítulo en el techo presupuestal'
            );
            return null;
          }

          console.log(`📊 Capítulo detectado: ${chapterKey} - ${chapterName}`);

          return {
            chapterKey: Number(chapterKey),
            chapterName: chapterName || 'Sin nombre',
          };
        }),
        catchError((error) => {
          console.error(
            '❌ Error al obtener capítulo del techo presupuestal:',
            error
          );
          return of(null);
        })
      );
  }

  /**
   * ✅ NUEVO: Manejo de errores específico para partidas
   */
  private handleItemsError(error: any): Observable<Item[]> {
    if (error.status === 404) {
      console.log(
        '📋 Endpoint de partidas no implementado (404) - desarrollo en progreso'
      );
      return of([]);
    }

    if (error.status === 0) {
      console.error('🔴 Error de conexión al servidor');
      return of([]);
    }

    console.error('❌ Error inesperado al cargar partidas:', error);
    return of([]);
  }

  /**
   * ✅ NUEVO: Método de utilidad para validar rango de capítulo
   */
  isValidChapterKey(chapterKey: number): boolean {
    const validChapters = [10000, 20000, 30000, 40000, 50000, 60000];
    const isValid = validChapters.includes(chapterKey);

    if (!isValid) {
      console.warn(
        `⚠️ Capítulo ${chapterKey} no está en la lista de capítulos válidos: ${validChapters.join(
          ', '
        )}`
      );
    }

    return isValid;
  }

  /**
   * ✅ NUEVO: Método para obtener información de filtro aplicado
   */
  getChapterFilterInfo(chapterKey: number): string {
    if (!this.isValidChapterKey(chapterKey)) {
      return 'Filtro de capítulo inválido';
    }

    const rangoMin = chapterKey;
    const rangoMax = chapterKey + 9999;
    return `Partidas ${rangoMin} - ${rangoMax}`;
  }
}
