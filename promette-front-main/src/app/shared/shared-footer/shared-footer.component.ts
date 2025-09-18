import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: 'app-footer',
  templateUrl: './shared-footer.component.html',
  styleUrls: ['./shared-footer.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class FooterComponent {
  footerLinks = [
    { label: "SEPE - USET", url: "https://septlaxcala.gob.mx/web/" },
    { label: "Politicas de Privacidad", url: "#" },
    { label: "Terminos y Condiciones", url: "#" },
  ]
}
