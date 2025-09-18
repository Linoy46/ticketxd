import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  
   version: string = "";

   ngOnInit() {
     this.version = this.getVersion();
   }

   //Obtener la version de la aplicacion
   getVersion() {
     if (typeof window !== 'undefined') {
       return localStorage.getItem('version') || '1.0.0';
    }
     return '1.0.0';
   }
   
  
}
