import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Promette';

  constructor(private httpClient: HttpClient) {}
    ngOnInit() {
      this.updateCacheVersion();
  }




//metodo para verificar si la version de la aplicacion es la mas actualizada
updateCacheVersion() {
  this.httpClient
    .get<{ version: string }>(`version/version.json?nocache=${Date.now()}`)
    .subscribe(configResponse => {
      const latestVersion = configResponse.version;
      const storedVersion = localStorage.getItem('version') || '';

      if (latestVersion !== storedVersion) {
        localStorage.setItem('version', latestVersion);
        location.reload();
      }
    });
}

}
