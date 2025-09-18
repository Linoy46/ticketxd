import { Injectable } from '@angular/core'; // Importa el decorador Injectable para hacer que este servicio sea inyectable
import { BehaviorSubject } from 'rxjs'; // Importa BehaviorSubject para manejar el estado reactivo

@Injectable({
    providedIn: 'root', // Hace que el servicio esté disponible a nivel de toda la aplicación
})
export class CoreLoadingService {
    // Creamos un BehaviorSubject que mantiene el estado de carga (true o false)
    private loadingSubject = new BehaviorSubject<boolean>(false);

    // Exponemos el estado de carga como un observable para que otros componentes se suscriban a él
    public loading$ = this.loadingSubject.asObservable();

    constructor() { }

    // Método para activar el estado de carga
    show() {
        this.loadingSubject.next(true);
    }

    // Método para desactivar el estado de carga
    hide() {
        this.loadingSubject.next(false);
    }
}
