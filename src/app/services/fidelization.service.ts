import { config, PROVIDER } from './../../environments/config';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class FidelizationService {
    private URL = ''
    private walletSubject: BehaviorSubject<any>;
    public currentWallet: Observable<any>;

  

    constructor(private http: HttpClient, private router: Router, public snackBar: MatSnackBar, @Inject(PLATFORM_ID) private platformId: any) {
        this.URL = config.domain
        this.walletSubject = new BehaviorSubject<any>(isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('wallet')) : null);
        this.currentWallet = this.walletSubject.asObservable();

        
    }
    public get currentWalletValue(): any {
        return this.walletSubject.value;
    }

    getWallet() {
        let url_api = this.URL + 'api/em/fidelization/get_wallet'
        return this.http.get<any>(url_api,)
            .pipe(map(res => {
                if (res.response == 'success') {
                    if(isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('wallet', JSON.stringify(res.data));
                    }

                    this.walletSubject.next(res.data);
                } else {
                    if(isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('wallet', JSON.stringify(null));
                    }
                    this.walletSubject.next(null);
                }
               
                return res;
            }));
    }
}