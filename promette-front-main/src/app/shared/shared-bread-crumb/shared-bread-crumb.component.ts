// Importación de los módulos necesarios de Angular
import { Location } from '@angular/common'; // Para manipular la ubicación (navegación hacia atrás)
import { Component } from '@angular/core'; // Decorador para definir el componente
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Módulos de enrutamiento de Angular

@Component({
  selector: 'shared-bread-crumb-component', // El selector del componente, utilizado en el HTML para invocar el componente
  imports: [RouterModule], // Importación de RouterModule para permitir la navegación
  templateUrl: './shared-bread-crumb.component.html', // Ruta del archivo de plantilla del componente
})
export class SharedBreadCrumbComponent {
  public currentRoute: string = 'Inicio'; // Variable para almacenar la ruta actual, con un valor por defecto de 'Inicio'

  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
    // Suscripción a los eventos del router para actualizar la ruta actual
    this.router.events
      .subscribe((d) => {
        // Accede a los datos de la primera ruta hija y actualiza 'currentRoute' con el nombre de la ruta
        this.route.firstChild?.data.subscribe(data => {
          this.currentRoute = data['name']; // Obtiene el nombre de la ruta desde los datos de la ruta activa
        });
      });
  }

  // Método para navegar hacia atrás en el historial
  goBack(): void {
    this.location.back(); // Utiliza el servicio Location para ir a la página anterior en el historial
  }
}
