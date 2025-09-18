import { Component } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'forms-select-acu-int-component',
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './forms-select-acu-int.component.html',
  styleUrl: './forms-select-acu-int.component.scss',
})
export class FormsSelectAcuIntComponent {
  date: Date | undefined;
}
