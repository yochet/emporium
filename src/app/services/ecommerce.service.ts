import { environment } from './../../environments/environment';
import { ModeOrderService } from './mode-order/mode-order.service';
import { Router } from '@angular/router';
import { PROVIDER } from './../../environments/config';
import { config } from '../../environments/config';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category, Product } from '../app.models';
import { MatDialog } from '@angular/material/dialog';
import { DialogCustomComponent } from '../shared/dialog-custom/dialog-custom.component';
import { isPlatformBrowser } from '@angular/common';

export class Data {
    constructor(public categories: Category[],
        public compareList: any[],
        public wishList: any[],
        public cartList: any[],
        public totalPrice: number,
        public totalCartCount: number) { }
}

//todo: asegurar que sea product

@Injectable()
export class EcommerceService {
    public pathImage = ''
    public Data = new Data(
        [], // categories
        [], // compareList
        [],  // wishList
        [],  // cartList
        null, //totalPrice,
        0 //totalCartCount
    )
    public brands = [] // pra traer marcas

    public url = "assets/data/";
    public domain = config.domain
    url_s3 = environment.url_amazon_s3

    // AUXILIAR PARA DETECTAR EL CAMBIO DESDE EL CHECKOUT
    listCartChange = new BehaviorSubject<any>(null)

    // AUXILIAR PARA DETECTAR EL INCREMENTAR DESDE PRODUCTOS
    quantityChange = new BehaviorSubject<any>(null)
    // AUXILIAR PARA DETECTAR cuando un producto fue añadido
    addChange = new BehaviorSubject<any>(null)


    // VARIABLE PARA EL ALMACENAMIENTO
    //localStorageData: any;

    constructor(public http: HttpClient, public snackBar: MatSnackBar, private route: Router,
        private matDialogService: MatDialog,
        private modeService: ModeOrderService,
        @Inject(PLATFORM_ID) private platformId: any
    ) {
        this.pathImage = this.domain + 'api/file_path/files/'

        this.defaultStorageLocalProduct()
    }


    //INICIO DE FUNCIONES PARA STORAGE
    defaultStorageLocalProduct() {
        if(isPlatformBrowser(this.platformId)) {
            if (JSON.parse(localStorage.getItem("cartProduct")) === undefined || JSON.parse(localStorage.getItem("cartProduct")) === null) {
                this.setStorageData()
            }
        }
        this.getLocalCart();
    }
    setStorageData() {
        if(isPlatformBrowser(this.platformId)) {
            localStorage.setItem("cartProduct", JSON.stringify(this.Data));
        }
    }

    clearStorageLocalProduct() {
        //this.productCartData = []
        //localStorage.setItem("cartProduct", JSON.stringify(this.productCartData));
        this.getLocalCart();
    }
    getLocalCart() {
        this.Data = isPlatformBrowser(this.platformId) ? JSON.parse(localStorage.getItem("cartProduct")) : [];
        //this.cartProductLength = this.localStorageProduct.length;
    }

    setStoragePedidoFinalizado(res){
        if(isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentCart', JSON.stringify(res));
        }
    }

    getStoragePedidoFinalizado(){
            return localStorage.getItem('currentCart')
    }
    // END STORAGE


    public getPathImage(image) {
        return this.pathImage + image
    }

    public getPathImageSlides(image) {
        let url_amazon = this.url_s3
        return url_amazon + '/banner/' + image
    }
    public getPathImageBlock(image) {
        let url_amazon = this.url_s3
        return url_amazon + '/block/' + image
    }

    public getPathImageEmergency(image){
        let url_amazon = this.url_s3
        return url_amazon + '/banner-emergency/' + image
    }
    // TODO: ajustar para que me tariga por lista de precio
    public getCategories(): Observable<Category[]> {
        //return this.http.get<Category[]>(this.url + 'categories.json');
        let url = this.domain + 'api/em/material_group/get_cb/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId) + (this.modeService.currentModeOrderValue == null ? '' : (!this.modeService.currentModeOrderValue.storeSelected.id ? '' : '/' + this.modeService.currentModeOrderValue.storeSelected.id + '/' + (this.modeService.currentModeOrderValue.orderSelected == 'PD' ? 'PD' : this.modeService.currentModeOrderValue.subOrderSelected)))
        return this.http.get<Category[]>(url);
    }

    // TODO: ajustar para el filtro desde el front
    /*     public getAllProducts(filter): Observable<any[]> {
            let url = this.domain + 'api/em/material/get_filter'
            return this.http.post<any[]>(url, filter)
        } */


    public getAllProducts(filter, skip, take): Observable<any[]> {
        let url = this.domain + `api/em/material/paginate?skip=${skip}&take=${take}`
        return this.http.post<any[]>(url, filter)
    }

    public getProducts(type): Observable<Product[]> {
        return this.http.get<Product[]>(this.url + type + '-products.json');
    }

    public getProductsByFavoriteId(id): Observable<Product[]> {
        return this.http.get<Product[]>(this.domain + 'api/em/material/get_favorites/' + id);
    }
    public getProductsByOrder(code): Observable<Product[]> {
        return this.http.get<Product[]>(this.domain + 'api/em/material/get_order_return/' + code);
    }


    // por code, estoy enviando quemado type y office
    public getProductById(code, type): Observable<any> {
        /* return this.http.get<Product>(this.url + 'product-' + id + '.json');
        'get/:code/:type/:office' */
        let url = this.domain + `api/em/material/get/${code}/${type}/0`
        return this.http.get<any>(url)
    }

    public getBanners(): Observable<any[]> {
        return this.http.get<any[]>(this.domain + 'api/em/slides/block/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId))
    }

    public addToCompare(product: any) {
        let message, status;
        if (this.Data.compareList.filter(item => item.code == product.code)[0]) {
            message = 'The product ' + product.name + ' already added to comparison list.';
            status = 'error';
        }
        else {
            this.Data.compareList.push(product);
            message = 'The product ' + product.name + ' has been added to comparison list.';
            status = 'success';
        }
        this.snackBar.open(message, '×', { panelClass: [status], verticalPosition: 'top', duration: 3000 });
    }

    public addToWishList(product: any) {
        let message, status;
        if (this.Data.wishList.filter(item => item.code == product.code)[0]) {
            message = 'The product ' + product.name + ' already added to wish list.';
            status = 'error';
        }
        else {
            this.Data.wishList.push(product);
            message = 'The product ' + product.name + ' has been added to wish list.';
            status = 'success';
        }
        this.snackBar.open(message, '×', { panelClass: [status], verticalPosition: 'top', duration: 3000 });
    }

    public addToCart(product: any) {
        let message, status;

        this.Data.totalPrice = null;
        this.Data.totalCartCount = null;

        if (this.Data.cartList.filter(item => item.code == product.code)[0]) {
            let item = this.Data.cartList.filter(item => item.code == product.code)[0];

            // modificate solo en el caso que sea tipo adicional 
            if (product.type == 'A') {
                let items = this.Data.cartList.filter(item => {
                    return (item.code.split('*')[0]) == product.code
                })
                let auxObj = Object.assign({}, product)
                auxObj.code = auxObj.code + '*' + (items.length + 1)
                // NO es lo correcto pero para salir rrapido del apuro le restare un 1
                //auxObj.cartCount = auxObj.cartCount - 1
                this.Data.cartList.push(auxObj)
            } else {
                // que continue con l oque hcia
                item.cartCount = product.cartCount;
            }
        }
        else {
            this.Data.cartList.push(product);
        }
        this.Data.cartList.forEach(product => {
            this.Data.totalPrice = this.Data.totalPrice + (product.cartCount * product.newPrice);
            this.Data.totalCartCount = this.Data.totalCartCount + product.cartCount;
        });

        message = 'Producto agregado a tu Carrito.';
        status = 'success';
        this.snackBar.open(message, '×', { panelClass: [status], verticalPosition: 'top', duration: 3000 });
        this.addChange.next(true)
        /// Actualizare el storage
        this.setStorageData()
    }
    updateTotalAndCount() {
        this.Data.totalPrice = null;
        this.Data.totalCartCount = null;
        this.Data.cartList.forEach(product => {
            this.Data.totalPrice = this.Data.totalPrice + (product.cartCount * product.newPrice);
            this.Data.totalCartCount = this.Data.totalCartCount + product.cartCount;
        });
    }

    public resetCart() {
        this.Data.totalPrice = null;
        this.Data.totalCartCount = 0;
        this.Data.cartList = [];
        /// Actualizare el storage
        this.setStorageData()
    }

    public resetProductCartCount(product: any) {
        product.cartCount = 0;
        let compareProduct = this.Data.compareList.filter(item => item.code == product.code)[0];
        if (compareProduct) {
            compareProduct.cartCount = 0;
        };
        let wishProduct = this.Data.wishList.filter(item => item.code == product.code)[0];
        if (wishProduct) {
            wishProduct.cartCount = 0;
        };

        // AQUI ACTUALIZARE SOLO SI ESTOY EN CHECKUT
        this.listCartChange.next(this.Data.cartList.length)
        /// Actualizare el storage
        this.setStorageData()
    }
    public getSliders() {

        //return this.http.get<Category[]>(this.url + 'categories.json');
        let url = this.domain + 'api/em/slides/get/horizontal/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId)
        return this.http.get<any[]>(url);
    }
    public getSlidersMobile() {

        //return this.http.get<Category[]>(this.url + 'categories.json');
        let url = this.domain + 'api/em/slides/get/vertical/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId)
        return this.http.get<any[]>(url);
    }

    public getBrands() {

        //return this.http.get<Category[]>(this.url + 'categories.json');
        let url = this.domain + 'api/em/brand/get'
        return this.http.get<any[]>(url);

    }

    public getSuggested(data) {
        let url = this.domain + 'api/em/material/get_suggested'
        return this.http.post<any[]>(url, data);

    }
    public getLastProductTen() {
        let url = this.domain + 'api/em/material/get_last_ten/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId) + '/' + (this.modeService.currentModeOrderValue == null ? '' : (this.modeService.currentModeOrderValue.orderSelected == 'PD' ? '' : this.modeService.currentModeOrderValue.subOrderSelected + '/')) + '' + (!this.modeService.currentModeOrderValue.storeSelected.id ? '' : this.modeService.currentModeOrderValue.orderSelected == 'PD' ? 'PD/' + this.modeService.currentModeOrderValue.storeSelected.id : this.modeService.currentModeOrderValue.storeSelected.id)
        return this.http.get<any[]>(url);
    }
    public getTopProductTen() {
        let url = this.domain + 'api/em/material/get_top_ten/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId) + '/' + (this.modeService.currentModeOrderValue == null ? '' : (this.modeService.currentModeOrderValue.orderSelected == 'PD' ? '' : this.modeService.currentModeOrderValue.subOrderSelected + '/')) + '' + (!this.modeService.currentModeOrderValue.storeSelected.id ? '' : this.modeService.currentModeOrderValue.orderSelected == 'PD' ? 'PD/' + this.modeService.currentModeOrderValue.storeSelected.id : this.modeService.currentModeOrderValue.storeSelected.id)
        return this.http.get<any[]>(url);
    }
    public getOffertsProductTen() {
        let url = this.domain + 'api/em/material/get_offerts_ten/' + (PROVIDER.providerId == null ? '' : PROVIDER.providerId) + '/' + (this.modeService.currentModeOrderValue == null ? '' : (this.modeService.currentModeOrderValue.orderSelected == 'PD' ? '' : this.modeService.currentModeOrderValue.subOrderSelected + '/')) + '' + (!this.modeService.currentModeOrderValue.storeSelected.id ? '' : this.modeService.currentModeOrderValue.orderSelected == 'PD' ? 'PD/' + this.modeService.currentModeOrderValue.storeSelected.id : this.modeService.currentModeOrderValue.storeSelected.id)
        return this.http.get<any[]>(url);
    }

    public async onVerifiedProducts() {

        if (this.Data.cartList.length == 0) {
            return true
        }
        let data = {
            codePrice: this.modeService.currentModeOrderValue == null ? null : (this.modeService.currentModeOrderValue.orderSelected == 'PD' ? 'PD' : this.modeService.currentModeOrderValue.subOrderSelected),
            type: this.modeService.currentModeOrderValue == null ? null : (this.modeService.currentModeOrderValue.orderSelected == 'PD' ? 'PD' : this.modeService.currentModeOrderValue.subOrderSelected),
            store: !this.modeService.currentModeOrderValue.storeSelected.id ? null : this.modeService.currentModeOrderValue.storeSelected.id,
            list: []
        }
        for (const item of this.Data.cartList) {
            let aux = {
                item: item.code,
                aditional: []
            }
            for (const ad of item.aditionalDetailV2) {
                aux.aditional.push({ item: ad.material.code })
            }
            data.list.push(aux)
        }

        let url = this.domain + 'api/em/material/validate/cart'
        let res: any[] = await this.http.post<any[]>(url, data).toPromise();


        let found = false
        let foundChangePrice = false
        for (let item of this.Data.cartList) {
            let f = res.find(res => res.item == item.code)
            if (f) {
                if (f.active_csm == '0' || f.active == '0') {
                    found = true
                }

                let result = this.getTotalItemSelected(item, f.newPrice) // llamare a mi funcion
                if (Number(result) != Number(item.newPrice)) {
                    foundChangePrice = true

                }
                item.active = f.active
                item.active_csm = f.active_csm
                item.newPrice = result
            } else {
                item.active = '0'
                item.active_csm = '0'
                found = true
            }
        }
        this.updateTotalAndCount()
        this.setStorageData()
        if (found || foundChangePrice) {

            let text = "De los productos que has añadido a tu carrito, algunos no se encuentran disponibles en estos momentos. A continuación, te presentaremos el detalle. Por favor, procede a eliminar los productos sin disponibilidad para que puedas continuar con tu pedido."

            if (found && foundChangePrice) {
                text = "De los productos que has añadido a tu carrito, algunos no se encuentran disponibles en estos momentos o cambiaron su precio. A continuación, te presentaremos el detalle. Por favor, procede a eliminar los productos sin disponibilidad para que puedas continuar con tu pedido."
            }
            if (!found && foundChangePrice) {
                text = "De los productos que has añadido a tu carrito, algunos cambiaron su precio. A continuación, te presentaremos el detalle. Continue el proceso para proceder con el pedido."
            }

            this.route.navigate(["carrito"])
            const dialogRef = this.matDialogService.open(DialogCustomComponent, {
                data: {
                    title: '¡Lo sentimos mucho!',
                    body: text,
                    no: null,
                    yes: 'Continuar'
                },
                width: "400px",
                disableClose: true,
                //panelClass: 'address-dialog',
                //direction: (this.settings.rtl) ? 'rtl' : 'ltr'
            })

            dialogRef.afterClosed().subscribe(result => {
                if (result == 'close' || result == undefined) {

                } else {
                    if (result == 'yes') {

                    }
                }
            })

        }
        return true

    }



    // IMAGENES PRODUCTOS

    public getPathImageOriginal(image) {
        let url_amazon = this.url_s3
        return url_amazon + '/original/' + image
    }
    public getPathImageSmall(image) {
        let url_amazon = this.url_s3
        return url_amazon + '/products/150X150/' + image
    }
    public getPathImageMedium(image) {
        let url_amazon = this.url_s3
        return url_amazon + '/products/500X500/' + image
    }
    public getPathImageBig(image) {
        let url_amazon = this.url_s3
        return url_amazon + '/products/1024X1024/' + image
    }


    private getTotalItemSelected(product, price) {
        let res = 0
        if (product == null) {
            return 0
        }
        res = Number(price)
        // VERIFICO SI ES TIPO A
        if (product.type == 'A') {
            for (let item of product.aditionalDetailV2) {

                if (item.isAditionalPrice == '1') {
                    res = res + (Number(item.price) * item.quantity)
                }

            }
        }
        return res
    }

    // Obtener el cupon
    getDataByCupon(code) {
        const url_api = this.domain + 'api/em/fidelization/cupon_verified/' + code
        return this.http.get(url_api);
    }
} 