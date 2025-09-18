import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CoreLoadingService } from '../../../core/services/core.loading.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private apiUrlPromette = environment.apiUrlPromette;

  constructor( private loading: CoreLoadingService,private http: HttpClient) { 
   
  }


  getMunicipalities(): any {
    return this.http.get(`${this.apiUrlPromette}/annecApplicant/getMunicipalities`);
  }

}
