import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { PermissionsService } from '../services/core.permissions.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsGuard implements CanActivate {
  constructor(
    private permisosService: PermissionsService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const permissionRequired = next.data['permission']; // Get the required permission from the route data

    try {
      // Check if the user has the required permission
      const hasPermission = await this.permisosService.havePermission(
        permissionRequired
      );

      if (hasPermission) {
        return true; // User has the required permission, so allow access
      } else {
        // If the user doesn't have the required permission, redirect to 'no access' page
        this.router.navigate(['promette/noaccess']);
        return false; // Deny access
      }
    } catch (error) {
      console.error('Error while checking permission', error);
      // If there was an error checking permissions, redirect to 'no access' page
      this.router.navigate(['promette/noaccess']);
      return false; // Deny access in case of error
    }
  }
}
