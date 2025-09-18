import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { SafeUrlPipe } from '../../core/pipes/safe-url.pipe';
import { MayusculasDirective } from '../../core/directives/mayusculas/mayusculas.directive';
import { TextareaModule } from 'primeng/textarea';
import { CursesService } from '../curses/services/curses.service';

@Component({
  selector: 'app-canva',
  templateUrl: './canva.component.html',
  styleUrls: ['./canva.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    SafeUrlPipe,
    MayusculasDirective,
    TextareaModule,
  ],
})
export class CanvaComponent implements AfterViewInit {
  @Input() data?: any; // Modo del formulario
  textContent: string = '';
  items: any[] = [];
  backgroundImage: string = '';
  pageOrientation: 'portrait' | 'landscape' = 'portrait';
  fontSizes: any[] = [
    { label: '8px', value: 8 },
    { label: '12px', value: 12 },
    { label: '16px', value: 16 },
    { label: '20px', value: 20 },
    { label: '24px', value: 24 },
    { label: '32px', value: 32 },
    { label: '48px', value: 48 },
    { label: '64px', value: 64 },
    { label: '84px', value: 84 },
    { label: '100px', value: 100 },
    { label: '200px', value: 200 },
    { label: '300px', value: 300 },
    { label: '400px', value: 400 },
    { label: '500px', value: 500 },
  ];
  selectedFontSize: number = 16;
  fontFamilies: any[] = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Verdana', value: 'Verdana' },
  ];
  selectedFontFamily: string = 'Arial';
  selectedColor: string = 'black';
  textEffects: any[] = [
    { label: 'Normal', value: 'normal' },
    { label: 'Sombra', value: 'shadow' },
    { label: 'Contorno', value: 'outline' },
    { label: 'Negrita', value: 'bold' },
    { label: 'Cursiva', value: 'italic' },
  ];
  selectedEffect: string = 'normal';

  isDragging: boolean = false;
  currentItem: any = null;
  offsetX: number = 0;
  offsetY: number = 0;

  // Dimensiones del lienzo en píxeles (ajustadas para coincidir con A4)
  canvasWidth: number = 595; // Ancho de A4 en píxeles (210mm * 2.83)
  canvasHeight: number = 842; // Alto de A4 en píxeles (297mm * 2.83)

  savedCanvasState: any = null;
  pdfUrl: any = '';

  constructor(private cusrsesService: CursesService) {}
  ngAfterViewInit(): void {
    this.loadCanvasState();
  }
  createItem() {
    if (this.textContent.trim() !== '') {
      const newItem = {
        text: this.textContent,
        x: 50,
        y: 50,
        fontSize: this.selectedFontSize,
        fontFamily: this.selectedFontFamily,
        color: this.selectedColor,
        effect: this.selectedEffect,
      };
      this.items.push(newItem);
      this.textContent = '';
    }
    this.generatePDF();
  }

  toggleOrientation() {
    this.pageOrientation =
      this.pageOrientation === 'portrait' ? 'landscape' : 'portrait';

    if (this.pageOrientation === 'landscape') {
      this.canvasWidth = 800; // Ancho de A4 en landscape
      this.canvasHeight = 595; // Alto de A4 en landscape
    } else {
      this.canvasWidth = 595; // Ancho de A4 en portrait
      this.canvasHeight = 842; // Alto de A4 en portrait
    }

    this.items.forEach((item) => {
      if (this.pageOrientation === 'landscape') {
        item.x = (item.x / 595) * 842;
        item.y = (item.y / 842) * 595;
      } else {
        item.x = (item.x / 842) * 595;
        item.y = (item.y / 595) * 842;
      }
    });
    this.generatePDF();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.backgroundImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    this.generatePDF();
  }

  onMouseDown(event: MouseEvent, item: any) {
    this.isDragging = true;
    this.currentItem = item;
    this.offsetX = event.clientX - item.x;
    this.offsetY = event.clientY - item.y;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.currentItem) {
      // Restricción para que el item no se salga del lienzo
      const newX = event.clientX - this.offsetX;
      const newY = event.clientY - this.offsetY;

      // Limitar el movimiento dentro del lienzo
      this.currentItem.x = Math.max(0, Math.min(newX, this.canvasWidth - 50)); // 50 es el ancho mínimo de los elementos
      this.currentItem.y = Math.max(0, Math.min(newY, this.canvasHeight - 30)); // 30 es la altura mínima de los elementos
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.currentItem = null;
    this.generatePDF();
  }

  generatePDF() {
    const doc = new jsPDF(this.pageOrientation, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width; // Ancho de página en mm
    const pageHeight = doc.internal.pageSize.height; // Alto de página en mm

    // Ajuste de la escala para convertir píxeles a milímetros
    const scaleX = pageWidth / this.canvasWidth;
    const scaleY = pageHeight / this.canvasHeight;

    const pxToPt = 0.75; // Escala de píxeles a puntos

    // Márgenes
    const marginX = 10; // Margen izquierdo
    const marginY = 10; // Margen superior

    const itemsCopy = this.items.map((item) => ({
      ...item,
      x: item.x * scaleX + marginX, // Ajuste de la posición X con margen
      y: item.y * scaleY + marginY, // Ajuste de la posición Y con margen
      fontSize: item.fontSize * pxToPt, // Ajuste de tamaño de fuente
    }));

    // Si hay imagen de fondo, la añadimos
    if (this.backgroundImage) {
      const img = new Image();
      img.src = this.backgroundImage;

      img.onload = () => {
        // Ajustamos la imagen de fondo para que cubra toda la página
        doc.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);

        // Añadimos los elementos de texto al PDF
        itemsCopy.forEach((item) => {
          this.addTextToPDF(doc, item);
        });

        const pdfUrl = doc.output('bloburl');
        this.pdfUrl = pdfUrl;
      };

      img.onerror = () => {
        alert('Error al cargar la imagen de fondo.');
      };
    } else {
      // Si no hay imagen de fondo, solo añadimos los elementos de texto
      itemsCopy.forEach((item) => {
        this.addTextToPDF(doc, item);
      });

      const pdfUrl = doc.output('bloburl');
      this.pdfUrl = pdfUrl;
    }
  }

  addTextToPDF(doc: jsPDF, item: any) {
    doc.setTextColor(item.color);
    doc.setFontSize(item.fontSize);
    doc.setFont(item.fontFamily);

    // Efecto de sombra
    if (item.effect === 'shadow') {
      doc.setTextColor(200, 200, 200); // Color de sombra
      doc.text(item.text, item.x + 1, item.y + 1); // Desplazamos un poco el texto
    }

    // Efecto de contorno
    if (item.effect === 'outline') {
      doc.setTextColor(255, 255, 255); // Color de contorno
      doc.text(item.text, item.x - 1, item.y - 1); // Contorno arriba izquierda
      doc.text(item.text, item.x + 1, item.y - 1); // Contorno arriba derecha
      doc.text(item.text, item.x - 1, item.y + 1); // Contorno abajo izquierda
      doc.text(item.text, item.x + 1, item.y + 1); // Contorno abajo derecha
    }

    // Estilo normal, negrita o cursiva
    if (item.effect === 'bold') {
      doc.setFont(item.fontFamily, 'bold');
    } else if (item.effect === 'italic') {
      doc.setFont(item.fontFamily, 'italic');
    } else {
      doc.setFont(item.fontFamily, 'normal');
    }

    // Se dibuja el texto en el PDF
    doc.setTextColor(item.color);
    doc.text(item.text, item.x, item.y);
  }

  saveCanvasState() {
    this.savedCanvasState = {
      items: this.items,
      backgroundImage: this.backgroundImage,
      pageOrientation: this.pageOrientation,
    };
    this.cusrsesService
      .registerCertificate(
        this.data.row.id_constanciaCurso,
        JSON.stringify(this.savedCanvasState)
      )
      .subscribe();
    // alert('Estado del lienzo guardado.');
  }

  loadCanvasState() {
    this.cusrsesService.getDesign(this.data.row.id_constanciaCurso).subscribe({
      next: (data) => {
        this.savedCanvasState = JSON.parse(data.design.constancia_design);
        this.items = this.savedCanvasState.items;
        this.backgroundImage = this.savedCanvasState.backgroundImage;
        this.pageOrientation = this.savedCanvasState.pageOrientation;
        this.generatePDF();
      },
    });
    this.generatePDF();
  }

  deleteItem(index: number) {
    this.items.splice(index, 1);
    this.generatePDF();
  }
}
