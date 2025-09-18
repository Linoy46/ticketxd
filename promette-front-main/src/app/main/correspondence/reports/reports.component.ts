import { Component } from '@angular/core';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
@Component({
  selector: 'reports-component',
  imports: [CommonModule, InputNumber, FormsModule, DatePicker],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  date: Date | undefined;
  value1: number = 0;
}
