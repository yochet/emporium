import { RequestNotificationComponent } from './../shared/request_notification/request_notification.component';
import { MatDialog } from '@angular/material/dialog';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { config, PROVIDER } from 'src/environments/config';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { environment } from 'src/environments/environment';
import { isPlatformBrowser } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class NotificationService {
  private URL = config.domain
  public currentNtifiySubject: BehaviorSubject<any>;
  public permitiNotificacion: BehaviorSubject<any>;

  public currentNotify: Observable<any>;

  //aux
  //NOTIFICACIONES
  token = null // lo usare para gegsitrar el token solo una vez

  constructor(
    private http: HttpClient,
    private afMessaging: AngularFireMessaging,
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.currentNtifiySubject = new BehaviorSubject<any>(isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem('currentNotification')) : null);
    this.permitiNotificacion = new BehaviorSubject<any>(isPlatformBrowser(this.platformId) ? localStorage.getItem('activeNotification') : null);

    this.currentNotify = this.currentNtifiySubject.asObservable();
  }

  public get currentNotifyValue(): any {
    return this.currentNtifiySubject.value;
  }


  //publicos
  //NOTIFICATIONS

  async activeNotification(user?: any) {

    if (this.currentNotifyValue == null) {
      const dialogRef = this.dialog.open(RequestNotificationComponent, {
        data: null,
        position: { top: "20px" },
        width: "400px",
        disableClose: true,
      })

      /* dialogRef.afterClosed().subscribe(result => {
        if (result == 'close' || result == undefined) {
        } else {
        }
      }) */
      let result = await dialogRef.afterClosed().toPromise()

      if (result == 'no') {
        if(isPlatformBrowser(this.platformId)) {
          localStorage.setItem("activeNotification", "0")
        }
        this.permitiNotificacion.next('0')
        return;
      }
      if (result == 'yes') {
        this.requestPushNotificationsPermission(user)
      }

    }

  }

  async requestPushNotificationsPermission(user?: any) { // requesting permission



    this.afMessaging.requestToken // getting tokens
      .subscribe(
        (token) => { // USER-REQUESTED-TOKEN
          if (this.currentNotifyValue == null) {

            var obj = {
              "token": token, // TOKEN DEL DISPOSITIVO
              "customerId": user != null ? user.bp_id : null, // ID DEL USUARIO, PUEDE SER NULO
              "providerId": PROVIDER.providerId, // id DE LA MARCA, OBIGATIGATORIO
              "topic": environment.topic, // TOPIC AL CUAL SE SUBCRIBIRA LA NOTIFICACION
              "provider": environment.providerNotification,// "push_kit"
              "projectId": environment.proyectId
            };

            this.create(
              obj
            ).subscribe()
          } else {
            // detecto si mi token cambio, si es asi l oactualizo una sola ves

            if (this.currentNotifyValue.tokenId != token) {
              var obj = {
                "token": token, // TOKEN DEL DISPOSITIVO
                "customerId": user != null ? user.bp_id : null, // ID DEL USUARIO, PUEDE SER NULO
                "providerId": PROVIDER.providerId, // id DE LA MARCA, OBIGATIGATORIO
                "topic": environment.topic, // TOPIC AL CUAL SE SUBCRIBIRA LA NOTIFICACION
                "provider": environment.providerNotification,// "push_kit"
                "projectId": environment.proyectId
              };

              this.update(this.currentNotifyValue.id, { token: token }).subscribe()
            }
          }


        },
        (error) => {
          console.error(error);
        }
      );

    this.afMessaging.messages
      .subscribe((message) => { console.log("recibii", message); });


  }
  deleteToken() {

    this.afMessaging.getToken
      .pipe(mergeMap(token => this.afMessaging.deleteToken(token)))
      .subscribe(
        (token) => { console.log('Token deleted!'); },
      );

  }

  // privados

  create(data) {
    // lo quemare aqui //TODO: revisar que se enviara
    let url_api = this.URL + 'api/device-web/set/'
    return this.http.post<any>(url_api, data)
      .pipe(map(res => {
        // 
        if(isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentNotification', JSON.stringify(res));
          this.currentNtifiySubject.next(res);
          localStorage.setItem("activeNotification", "1")
          this.permitiNotificacion.next('1')
        }
        return res;
      }));
  }

  update(id, data) {
    // lo quemare aqui //TODO: revisar que se enviara
    let url_api = this.URL + 'api/device-web/update/' + id
    return this.http.put<any>(url_api, data)
      .pipe(map(res => {
        // 
        if(isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentNotification', JSON.stringify(res));
        }
        this.currentNtifiySubject.next(res);
        return res;
      }));
  }
  delete(id) {
    // lo quemare aqui //TODO: revisar que se enviara
    let url_api = this.URL + 'api/device-web/delete/' + id
    return this.http.delete<any>(url_api, id)
      .pipe(map(res => {
        // 
        if(isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('currentNotification');
        }
        this.currentNtifiySubject.next(null);
        return res;
      }));
  }
}