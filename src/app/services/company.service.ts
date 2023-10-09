import { config, PROVIDER } from './../../environments/config';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class CompanyService {
  private URL = ''
  private currentCompanySubject: BehaviorSubject<any>;
  public currenCompany: Observable<any>;
  private currentPickupSubject: BehaviorSubject<any>;
  public currenPickup: Observable<any>;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any) {
    this.URL = config.domain
    this.currentCompanySubject = new BehaviorSubject<any>(isPlatformBrowser(this.platformId) ? JSON.parse(sessionStorage.getItem('currentCompany')) : null);
    this.currenCompany = this.currentCompanySubject.asObservable();
    /*this.currentPickupSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('currentPickup')));
    this.currenPickup = this.currentPickupSubject.asObservable();*/
  }

  public get currentCompanyValue(): any {
    return this.currentCompanySubject.value;
  }

  getConfigCompany() {
    // lo quemare aqui //TODO: revisar que se enviara
    let url_api = this.URL + 'api/em/company/get/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId)
    return this.http.get<any>(url_api)
      .pipe(map(res => {
        // store res details and jwt token in local storage to keep res logged in between page refreshes
        if(isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('currentCompany', JSON.stringify(res));
        }
        
        this.currentCompanySubject.next(res);
        return res;
      }));
  }
  /*getPickup(){
    let url_api = this.URL + 'api/em/company/getPickup'
    return this.http.get<any>(url_api)
      .pipe(map(res => {
        sessionStorage.setItem('currentPickup', JSON.stringify(res));
        this.currentPickupSubject.next(res);
        return res;
      }))
  }*/
}