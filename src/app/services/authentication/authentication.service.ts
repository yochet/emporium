import { config, PROVIDER } from './../../../environments/config';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './user';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../notification.service';
import { isPlatformBrowser } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private URL = ''
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private currentPointsSubject: BehaviorSubject<any>;
  public currentPoints: Observable<any>;

  constructor(private http: HttpClient, private router: Router, public snackBar: MatSnackBar, private notificationService: NotificationService, 
      @Inject(PLATFORM_ID) private platformId: any) {
    this.URL = config.domain
    this.currentUserSubject = new BehaviorSubject<User>(isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('currentUser')) : null);
    this.currentUser = this.currentUserSubject.asObservable();

    // puntos
    this.currentPointsSubject = new BehaviorSubject<any>(isPlatformBrowser(this.platformId) ? JSON.parse(sessionStorage.getItem('currentPoints')) : null);
    this.currentPoints = this.currentPointsSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get currentPointsValue(): any {
    return this.currentPointsSubject.value;
  }

  login(userName: string, password: string) {
    let url_api = this.URL + 'api/auth/signin'
    return this.http.post<any>(url_api, { userName, password })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        if(isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
        if (this.notificationService.permitiNotificacion.value == '1') {
          this.notificationService.requestPushNotificationsPermission(this.currentUserValue);
        }
        this.getPoints()
        return user;
      }));
  }

  public auxreturnUrl = ''
  public auxcodeListPrice = ''

  loginFacebook(returnUrl, codeListPrice) {
    this.auxreturnUrl = returnUrl
    this.auxcodeListPrice = codeListPrice
    window.open(this.URL + 'api/social-login/facebook', "mywindow", "location=1,status=1,scrollbars=1, width=600, height=600, left=400, top=50");
    window.addEventListener('message', this.i)
  }

  loginGoogle(returnUrl, codeListPrice) {
    this.auxreturnUrl = returnUrl
    this.auxcodeListPrice = codeListPrice
    window.open(this.URL + 'api/social-login/google', "mywindow", "location=1,status=1,scrollbars=1, width=600, height=600, left=400, top=50");
    window.addEventListener('message', this.i)
  }

  // el ingreso tanto por facebook o google es lo mismo
  public i = (event) => this.ingresoSocialLogin(event)

  ingresoSocialLogin(message) {
    if (message.data.response == 'success') {
      let res = message.data.data
      if(isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(res));
      }
      this.currentUserSubject.next(res);
      if (this.notificationService.permitiNotificacion.value == '1') {
        this.notificationService.requestPushNotificationsPermission(this.currentUserValue);
      }

      this.snackBar.open(`Bienvenido ${res.user.bp_agent}`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      this.router.navigateByUrl(this.auxreturnUrl);
      window.removeEventListener('message', this.i)

    } else if (message.data.response == 'error') { // no existe entonces lo envía a registrar
      let send = {
        agent: message.data.data.agent,
        email: message.data.data.email,
        codeListPrice: this.auxcodeListPrice,
        bpp: PROVIDER.providerId
      }

      let url_api = this.URL + 'api/social-login/registerCSM'
      // registra y devuelve el usuario logeado
      this.http.post<any>(url_api, send).subscribe(res => {

        if (res.response == 'success') {
          let aux = res.data
          if(isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(aux));
          }
          this.currentUserSubject.next(aux);
          if (this.notificationService.permitiNotificacion.value == '1') {
            this.notificationService.requestPushNotificationsPermission(this.currentUserValue);
          }

          this.snackBar.open(`Bienvenido ${aux.user.bp_agent}`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          this.router.navigate([this.auxreturnUrl]);
        } else if (res.response == 'error') {
          this.snackBar.open(res.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
        window.removeEventListener('message', this.i)
      }, error => {
        this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
        window.removeEventListener('message', this.i)
      })
    } else if (message.data.response == 'no email') {
      this.snackBar.open(message.data.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
      window.removeEventListener('message', this.i)
    } else {
      window.removeEventListener('message', this.i)
    }
  }

  logout() {
    // remove user from local storage to log user out
    if(isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/ingresar'], { queryParams: { returnUrl: this.router.routerState.snapshot.url } });
  }

  registerCSM(data) {
    let url_api = this.URL + 'api/em/auth/register_csm'
    return this.http.post<any>(url_api, data)
  }

  sigInInvite(data) {
    let url_api = this.URL + 'api/em/auth/signin-invite'
    return this.http.post<any>(url_api, data)
      .pipe(map(res => {
        if (res.response == 'success') {
          if(isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(res.data));
          }
          this.currentUserSubject.next(res.data);
        }
        return res;
      }));
  }

  getUsetToken(data) {
    let url_api = this.URL + 'api/em/auth/getusertoken'
    return this.http.post<any>(url_api, data)
  }

  resetPassword(data) {
    let url_api = this.URL + 'api/em/auth/reset/password'
    return this.http.post<any>(url_api, data)
  }

  requestReset(body): Observable<any> {
    return this.http.post(this.URL + 'api/em/auth/req_reset_password', body);
  }

  newPassword(body): Observable<any> {
    return this.http.post(`${this.URL}api/em/auth/new_password`, body);
  }

  ValidPasswordToken(body): Observable<any> {
    return this.http.post(`${this.URL}api/em/auth/valid_password_token`, body);
  }

  updateData(id, data) {
    return this.http.put(`${this.URL}api/em/auth/update_csm/${id}`, data);
  }

  updateCurrentUser(user) {
    //TODO SEPARAR TOKEN DE USER
    let current = isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('currentUser')) : null
    current.user = user
    if(isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(current));
    }
    this.currentUserSubject.next(current);
  }

  getPoints() {
    let url_api = this.URL + 'api/em/fidelization/get_points'
    return this.http.get<any>(url_api,)
      .pipe(map(res => {
        if(isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('currentPoints', JSON.stringify(res));
        }
        
        this.currentPointsSubject.next(res);
        return res;
      }));
  }
}