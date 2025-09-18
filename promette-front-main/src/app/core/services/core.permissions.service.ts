import { Injectable } from '@angular/core';
import { UsersService } from '../../main/system-admin/users/services/users.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../store';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private userSelector = injectSelector<RootState, any>((state) => state.auth);

  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }
  constructor(private userService: UsersService) {}

  havePermission(permiso: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const checkPermission = () => {
        //resolve(true);
        //return;
        if (this.user.user) {
          // User is available, perform permission check
          this.userService
            .getPermissionsUsersByUser(this.user.user.id_usuario)
            .subscribe(
              ({ permissionsArray }) => {
                // Permisos del usuarios
                // console.log(permissionsArray);
                // Check if the permission exists in the list
                const hasPermission = permissionsArray.some(
                  (permission: any) => permission === permiso
                );
                resolve(hasPermission); // Resolve the promise with the result
              },
              (error) => {
                console.error('Error checking permissions', error); // Error logging
                reject(false); // Reject with false, or handle as needed
              }
            );
        } else {
          // User is not yet available, retry after a short delay
          setTimeout(checkPermission, 1000); // Retry after 1 second
        }
      };

      // Start checking
      checkPermission();
    });
  }
}
