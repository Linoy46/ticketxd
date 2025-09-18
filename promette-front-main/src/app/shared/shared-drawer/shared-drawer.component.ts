import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { PermisionsDirective } from '../../core/directives/permissions/has-permission.directive';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../store';

@Component({
  selector: 'shared-drawer-component',
  templateUrl: './shared-drawer.component.html',
  styleUrls: ['./shared-drawer.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    NgbAccordionModule,
    //PermisionsDirective,
  ],
})
export class SharedDrawerComponent {
  @Input() isMini = false;

  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  private permissionsSelector = injectSelector<RootState, any>(
    (state) => state.auth.permissions
  );
  // Aquí se obtiene el usuario con un getter
  get permissions() {
    return this.permissionsSelector(); // Se actualiza automáticamente
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }


}
