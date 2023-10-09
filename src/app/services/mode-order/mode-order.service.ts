import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
export class City {
    code: string = null
    name: string = null
}
export class Address {
    name: string = null
}
export class Store {
    id: Number = null
    address: string = null
    name: string = null
    username: string = null
    location_two_code: string = null
    location_two_name: string = null
    general_range_hour: any[] = []
}
export class ModeOrder {
    orderSelected: any = null // por defecto
    subOrderSelected: any = null
    storeSelected: Store = new Store()
    citySelected: City = new City()
    addressSelected: Address = new Address()
}


//todo: asegurar que sea product

@Injectable({ providedIn: 'root' })
export class ModeOrderService {

    /* {
        orderSelected: null //'delivery' // pickup
        storeSelected: null // storeId,
        typeOrder: null // walk | car | local
    } */

    private currentModeOrderSubject: BehaviorSubject<ModeOrder>;
    public currentMode: Observable<ModeOrder>;

    constructor(public http: HttpClient, public snackBar: MatSnackBar, @Inject(PLATFORM_ID) private platformId: any) {
        /* this.currentModeOrderSubject = new BehaviorSubject<ModeOrder>(JSON.parse(sessionStorage.getItem('modeOrder'))); */
        this.currentModeOrderSubject = new BehaviorSubject<ModeOrder>(null); // evitara que cargue por defecto, sino que siempre al inicio cargarà mi PD
        this.currentMode = this.currentModeOrderSubject.asObservable();
    }
    public get currentModeOrderValue(): ModeOrder {
        return this.currentModeOrderSubject.value;
    }

    updateCurrentModeOrder(data: ModeOrder) {
        //TODO SEPARAR TOKEN DE USER
        if(isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('modeOrder', JSON.stringify(data));
        }
        
        this.currentModeOrderSubject.next(data);
    }

    //INICIO DE FUNCIONES PARA STORAGE
    // END STORAGE
} 