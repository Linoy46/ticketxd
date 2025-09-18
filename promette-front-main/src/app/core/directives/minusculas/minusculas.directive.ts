import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMinusculas]',
})
export class MinusculasDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input') onInput() {
    this.convertirAMayusculas();
  }

  convertirAMayusculas() {
    const input = this.el.nativeElement;
    input.value = input.value.toUpperCase();
  }
}
