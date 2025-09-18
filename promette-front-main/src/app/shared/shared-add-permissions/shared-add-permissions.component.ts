import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { injectSelector } from '@reduxjs/angular-redux';
import { TreeNode } from 'primeng/api'; // Asegúrate de importar TreeNode de PrimeNG
import { Tree } from 'primeng/tree';
import { RootState } from '../../store';
@Component({
  selector: 'shared-add-permissions-component',
  imports: [CommonModule, Tree],
  templateUrl: './shared-add-permissions.component.html',
  styleUrls: ['./shared-add-permissions.component.css'],
})
export class SharedAddPermissionsComponent implements OnInit {
  @Input() data?: any; // Recibe los datos desde el componente padre

  files!: any[]; // Nodo del árbol que será utilizado por el p-tree
  selectedFiles!: any[]; // Para manejar la selección
  initialPermissions!: any[]; // Guardar los permisos originales para comparar después
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }
  ngOnInit() {
    if (this.data) {
      // Convertir las claves y sus elementos en la estructura de nodos para el árbol
      this.files = Object.keys(this.data.modules).map((key) => {
        const children: TreeNode[] = this.data.modules[key].map(
          (module: any, index: number) => ({
            label: module.label,
            data: module.key,
            key: module.key,
            children: [], // Dejar vacío si no hay sub-elementos
          })
        );

        return {
          label: key, // La clave como el nodo principal
          data: key,
          key: key,
          selectable: false,
          children: children, // Los módulos como hijos del nodo principal
        };
      });

      // Marcar como seleccionados los nodos de acuerdo con los permisos
      if (this.data.permissions && this.data.permissions.length > 0) {
        // Solo seleccionar los nodos cuyo `key` coincida con `dt_funcion_id` de `permissions`
        this.selectedFiles = [];
        this.initialPermissions = [...this.data.permissions]; // Guardar los permisos iniciales


        // Recorremos todos los nodos
        this.files.forEach((file) => {
          file.children.forEach((child: any) => {
            // Comprobamos si el `dt_funcion_id` coincide con el `key` de algún permiso
            const permission = this.data.permissions.find(
              (perm: any) => perm.dt_funcion_id === child.key
            );

            // Si existe una coincidencia, marcamos el nodo como seleccionado
            if (permission) {
              child.selected = true;
              this.selectedFiles.push(child); // Añadimos el nodo seleccionado a la lista
            }
          });
        });
      }
    }
  }

  onSubmmit(): void {

    let selectedPermissions: any[] = [];
    let removedPermissions: any[] = [];

    //let form: any[] = [];

    // Identificar los permisos seleccionados actuales
    this.selectedFiles.forEach((e) => {
      if (e.parent) {
        if (this.data.mode == 'users') {
          selectedPermissions.push({
            ct_usuario_id: this.data.id_usuario,
            dt_funcion_id: e.key,
          });
        } else {
          selectedPermissions.push({
            ct_puesto_id: this.data.id_puesto,
            dt_funcion_id: e.key,
          });
        }
      }
    });

    // Identificar los permisos que se han deseleccionado
    if (this.initialPermissions) {
      this.initialPermissions.forEach((perm: any) => {
        const stillSelected = this.selectedFiles.find(
          (file: any) => file.key === perm.dt_funcion_id
        );

        if (!stillSelected) {
          if(this.data.mode == 'users'){
            removedPermissions.push({
              ct_usuario_id: perm.ct_usuario_id || this.data.id_usuario,
              dt_funcion_id: perm.dt_funcion_id,
            });
          }
          else{
            removedPermissions.push({
              ct_puesto_id: perm.ct_puesto_id || this.data.id_puesto,
              dt_funcion_id: perm.dt_funcion_id,
            });
          }

        }
      });
    }

    // Guardar los permisos seleccionados
    if (selectedPermissions.length > 0) {
      this.data.savePermissions(selectedPermissions);
    }

    // Enviar los permisos deseleccionados al backend
    if (removedPermissions.length > 0) {
      this.data.removePermissions(removedPermissions);
    }
    console.log("Selected permissions: ",selectedPermissions)
    console.log("Removed permissions: ",removedPermissions)

    //this.data.savePermissions(form);
  }
}
