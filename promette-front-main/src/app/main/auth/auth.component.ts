import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/shared-footer/shared-footer.component';

@Component({
  selector: 'auth-component',
  standalone: true,
  imports: [RouterModule, CommonModule, FooterComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {}
