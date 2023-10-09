import { HostNameService } from './../../../../theme/utils/hostname.service';
import { OpenPayPopupComponent } from './../../../../shared/open-pay-popup/open-pay-popup.component';
import { DialogCustomComponent } from './../../../../shared/dialog-custom/dialog-custom.component';
import { CriptoService } from './../../../../services/cripto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService } from './../../../../services/company.service';
import { PaymentService } from './../../../../services/payment.service';
import { OrderService } from './../../../../services/order.service';

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LoadPayComponent } from '../../../../shared/load-pay/load-pay.component';
import { Coupon } from 'src/app/models/coupon';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { FidelizationService } from 'src/app/services/fidelization.service';
import { SnackBarService } from 'src/app/services/snackbar.service';
import { getISVofTotal } from 'src/app/theme/utils/helper';
import { ErrorManagementService } from 'src/app/services/error-management.service';
import { EcommerceService } from 'src/app/services/ecommerce.service';


function expDateValidators(c: FormControl) {
  const monthAndYear = /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/;
  let expired = false
  if (c.value != null && c.value.length == 4) {
    // get current year and month
    let d = new Date();
    let currentYear = d.getFullYear();
    let currentMonth = d.getMonth() + 1;
    // get parts of the expiration date
    let part1 = c.value.substring(0, 2);
    let part2 = c.value.substring(2, 4);
    let year = parseInt(part2, 10) + 2000;
    let month = parseInt(part1, 10);
    // compare the dates
    if (year < currentYear || (year == currentYear && month < currentMonth)) {
      expired = true
    }
  }
  return (monthAndYear.test(c.value)
    && !expired) ? null
    : {
      validateInput: {
        valid: false,
      },
    };
}

@Component({
  selector: 'ms-order-pay',
  templateUrl: './order-pay.component.html',
  styleUrls: ['./order-pay.component.scss']
})
export class OrderPayComponent implements OnInit, OnDestroy {


  //Payment
  typePay = null
  mapPayMethod = {} // mapa 
  selectedOptionDepo = null
  listOptionDeposito = []
  listPayMethod: any[] = []
  listBank: any[] = []
  listTransfer: any[] = []
  selectedBank = null
  selectedTransfer = null
  codeOrder = null
  loadPay = false
  operationNumber = null
  file: any = null // auxiliar del archivo
  imageUrl: any = null // url de la iamgen
  payNow = true

  commentError = null // sol opara el caso de pago en efectivo
  sendComment = '0' // sol opara el caso de pago en efectivo



  //observables
  obs: Subscription[] = []
  //_user: any = null
  company;

  // DOCUMENTO
  // factura  voleta
  selectedDoc = "0" // 0 voleta 1 factura
  dataFactura = {
    ruc: '',
    company: ''
  }

  // CREDIT CARD
  creditForm: FormGroup;
  typeCarSelected = 'default' // auxiliar para ver que tarjeta selecone
  mask = '0000 0000 0000 0000'

  hostname = null

  // FIDELIZATION
  totalDiscount = 0; // este es el total a descontar;
  currentPoints = 0;
  totalPoints = 0;
  limitPoints = 0;
  viewDiscountPoints = 0; // sera mi auxiliar

  _coupon: Coupon = null;
  _couponText = null;
  _couponMessage = null;
  _point = null;
  _wallet = null;
  //end fid

  total: number = 0
  totalTemp: number = 0
  salesTaxt = 0

  constructor(


    public orderService: OrderService,
    private paymentService: PaymentService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private matDialogService: MatDialog,
    private criptoService: CriptoService,
    private companyService: CompanyService,
    private hostnameService: HostNameService,
    private authService: AuthenticationService,
    private fidService: FidelizationService,
    public ecommerceService: EcommerceService,
    private snackBarService: SnackBarService,
    private errorService: ErrorManagementService,
    public dialogRef: MatDialogRef<OrderPayComponent>, @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.hostname = this.hostnameService.getHostname()

    this.obs.push(this.companyService.currenCompany.subscribe(res => {
      this.company = res
    }))
    this.obs.push(
      this.authService.currentPoints.subscribe((res: any) => {
        this.currentPoints = res ? res.data : 0
      })
    )
    this.obs.push(this.fidService.currentWallet.subscribe(res => {
      this._wallet = res ? res : null;
    }))

    this.creditForm = this.formBuilder.group({

      CardNumber: [null, [Validators.required, Validators.minLength(15), Validators.maxLength(16)]],
      BillToFirstName: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z ]+$")])],
      BillToLastName: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z ]+$")])],
      CardCVV2: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      CardExpiryDate: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(4), expDateValidators]],

      BillToAddress: [''], // YA NO REQUERIDO
      BillToTelephone: ['', [Validators.pattern("^[0-9]{8}")]], // YA NO REQUERIDO
      BillToZipPostCode: ['11101', [Validators.minLength(3), Validators.maxLength(10)]], // YA NO REQUERIDO
      BillToEmail: ['', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$")]], // YA NO REQUERIDO
      order: [null, [Validators.required]]

    });


  }

  getTypeCreditCard(number) {
    var insertedCardType = 'default';

    var cardsTypes = [
      { type: 'visa', regex: /^4/ },
      { type: 'mastercard', regex: /^5[1-5]/ },
      { type: 'american-express', regex: /^3[47]/ },
      { type: 'diners', regex: /^30[0-5]/ },
      { type: 'jcb', regex: /^35(2[89]|[3-8][0-9])/ },
      { type: 'visa-electron', regex: /^(4026|417500|4508|4844|491(3|7))/ },
      { type: 'maestro', regex: /^(5000|5018|5020|5038|6304|6759|676[1-3])/ },
      { type: 'discover', regex: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/ }
    ];
    if (number) {
      cardsTypes.forEach(ct => {
        if (ct.regex.test(number.substring(0, 6))) {
          insertedCardType = ct.type;
          if (ct.type == 'american-express') {
            this.mask = '0000 0000 0000 000'
          } else {
            this.mask = '0000 0000 0000 0000'
          }
        }
      });
    }
    return insertedCardType;
  };

  ngOnInit() {
    console.log(this.data)
    this.codeOrder = this.data.code
    this.salesTaxt = this.data.tax
    this.calculateTaxed()
    this.ongetListPayMethod()

  }
  ongetListPayMethod() {
    this.paymentService.getListPayMethod().subscribe((data: any) => {
      this.listPayMethod = data
      // agrupo por tipo
      this.mapPayMethod = {}
      this.listPayMethod.forEach(element => {
        if (this.mapPayMethod[element.type] === undefined) {
          this.mapPayMethod[element.type] = [element]
        }
        else {
          this.mapPayMethod[element.type].push(element)
        }
      });

    }, error => {
      //this.errorSevice.getErrorMessage(error)
    })
  }
  ongetListBank() {
    this.paymentService.getListBank().subscribe((data: any) => {
      this.listBank = data
      if (this.listBank.length != 0) {
        this.selectedBank = this.listBank[0]
        this.onGetListTransfer()
      }
    }, error => {
      //this.errorSevice.getErrorMessage(error)
    })
  }

  onGetListTransfer() {
    this.listTransfer = []
    this.selectedTransfer = null


    let send = {
      bankCode: this.selectedBank.code
    }
    this.paymentService.getListTranfersByBank(send).subscribe((data: any) => {
      this.listTransfer = data
      if (this.listTransfer.length != 0) {
        this.selectedTransfer = this.listTransfer[0]
      }
    }, error => {
      //this.errorSevice.getErrorMessage(error)
    })
  }



  /*   onSavePagePayOrderv1() {
  
      if (this.codeOrder == null) {
        //this.toastr.error("El código de tu pedido, no está disponible.")
        return
      }
      this.loadPay = true
      // metodo pago directo
      if (this.typePay == '0') {
  
        let formData = new FormData()
        formData.append("order", this.codeOrder)
        formData.append("paymentMethod", this.mapPayMethod['0'][0].code)
        formData.append("operationNumber", "Pago en Efectivo")
  
        this.paymentService.saveOrderPay(formData).subscribe(res => {
          //this.toastr.success("Operación ejecutada con éxito.")
          this.dialogRef.close("success")
          this.loadPay = false
        }, error => {
          this.loadPay = false
          // this.errorSevice.getErrorMessage(error)
        })
      }
      // metodo bancario
      if (this.typePay == '1') {
        if (this.selectedTransfer == null) {
          if (this.selectedOptionDepo == null) {
            //this.toastr.info("Por favor seleccione una opción de depósito.")
            this.loadPay = false
            return
          }
          if (this.selectedBank == null) {
            // this.toastr.info("Por favor seleccione un banco.")
            this.loadPay = false
            return
          }
          //this.toastr.info("Por favor seleccione un tipo de moneda.")
          this.loadPay = false
          return
        }
  
        if (this.payNow) {
          if (this.file == null || this.operationNumber == null) {
            //this.toastr.info("Campo obligatorio, Num. Operación/Comprobante.")
            this.loadPay = false
            return
          }
          let formData = new FormData()
          formData.append("order", this.codeOrder)
          formData.append("paymentMethod", this.selectedOptionDepo.code)
          formData.append("codeBank", this.selectedBank.code)
          formData.append("idBankTransfers", this.selectedTransfer.id)
          formData.append("operationNumber", this.operationNumber)
          if (this.file != null) {
            formData.append("document", this.file)
          }
          this.paymentService.saveOrderPay(formData).subscribe(res => {
            //this.toastr.success("Operación ejecutada con éxito.")
            this.dialogRef.close("success")
            this.loadPay = false
            //this.ecommerceService.clearStorageLocalProduct()
          }, error => {
            this.loadPay = false
            // this.errorSevice.getErrorMessage(error)
          })
        } else {
          let send = {
            status: "1"
          }
          this.paymentService.updateStateOrder(this.codeOrder, send).subscribe(res => {
  
            //this.toastr.success("Operación ejecutada con éxito.")
            this.dialogRef.close("success")
            this.loadPay = false
            //this.ecommerceService.clearStorageLocalProduct()
          }, error => {
            this.loadPay = false
            //this.errorSevice.getErrorMessage(error)
          })
        }
  
      }
  
      if (this.typePay != '1' && this.typePay != '0') {
        //this.toastr.error("Aun no implementado.")
        this.loadPay = false
        return
      }
    } */

  onSavePagePayOrder() {
    if (this.typePay == null || this.typePay == '') {
      this.snackBar.open('Por favor selecciona un metodo de pago.', '×', { panelClass: 'info', verticalPosition: 'top', duration: 3000 });
      return
    }

    if (this.company.switchDocument == '1') {
      if (this.selectedDoc == '1') {
        if (this.dataFactura.ruc == '' || this.dataFactura.company == '') {
          this.snackBar.open('Por favor complete los datos para factura.', '×', { panelClass: 'info', verticalPosition: 'top', duration: 3000 });
          return
        }
      }
    }

    if (this.codeOrder == null) {
      //this.toastr.error("El código de tu pedido, no está disponible.")
      this.snackBar.open("No existe una orden", '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      return
    }
    // metodo pago directo
    if (this.typePay == '0') {

      let formData = new FormData()
      formData.append("order", this.codeOrder)
      formData.append("paymentMethod", this.mapPayMethod['0'][0].code)
      formData.append("operationNumber", "Pago en Efectivo")

      formData.append("new_total", String(this.getTotal()))
      formData.append("points", this._point == null ? '0' : String(this.totalPoints))
      formData.append("coupons", this._coupon == null ? '' : this._coupon.valid ? this._coupon.uniqueCode : '')
      formData.append("discount", String(this.totalDiscount))

      //tipo de documento y delivery
      formData.append("bp_id", this.data.customer_id)

      if (this.company.switchDocument == '1' && this.selectedDoc == '1') {
        formData.append("typeDocument", this.selectedDoc)
        formData.append("typeDocumentInfo", this.dataFactura.ruc + '/' + this.dataFactura.company)
      }

      if (this.sendComment == '1' && (this.commentError === null || this.commentError === '')) {
        this.snackBar.open('Ingrese una nota de cambio', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        return
      }
      if (this.sendComment == '1') {
        formData.append("commentError", this.commentError)
      }
      this.paymentService.saveOrderPay(formData).subscribe(res => {
        //this.toastr.success("Operación ejecutada con éxito.")
        //this.router.navigate(["/ecommerce/order/" + this.codeOrder])
        //this.loadPay = false
        console.log("savepay", res)
        this.snackBar.open(`Pago Realizado`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.dialogRef.close('success')
        this.openSuccess()

        //this.ecommerceService.clearStorageLocalProduct()
      }, error => {
        //this.loadPay = false
        console.log(error)
        //this.errorSevice.getErrorMessage(error)
      })
    }
    // metodo bancario
    if (this.typePay == '1') {
      if (this.selectedTransfer == null) {
        if (this.selectedOptionDepo == null) {
          //this.toastr.info("Por favor seleccione una opción de depósito.")
          //this.loadPay = false
          return
        }
        if (this.selectedBank == null) {
          //this.toastr.info("Por favor seleccione un banco.")
          //this.loadPay = false
          return
        }
        //this.toastr.info("Por favor seleccione un tipo de moneda.")
        //this.loadPay = false
        return
      }

      if (this.payNow) {
        if (this.file == null || this.operationNumber == null) {
          //this.toastr.info("Campo obligatorio, Num. Operación/Comprobante.")
          // this.loadPay = false
          return
        }
        let formData = new FormData()
        formData.append("order", this.codeOrder)
        formData.append("paymentMethod", this.selectedOptionDepo.code)
        formData.append("codeBank", this.selectedBank.code)
        formData.append("idBankTransfers", this.selectedTransfer.id)
        formData.append("operationNumber", this.operationNumber)

        formData.append("new_total", String(this.getTotal()))
        formData.append("points", this._point == null ? '0' : String(this.totalPoints))
        formData.append("coupons", this._coupon == null ? '' : this._coupon.valid ? this._coupon.uniqueCode : '')
        formData.append("discount", String(this.totalDiscount))

        //tipo de documento y delivery
        formData.append("bp_id", this.data.customer_id)
        if (this.company.switchDocument == '1' && this.selectedDoc == '1') {
          formData.append("typeDocument", this.selectedDoc)
          formData.append("typeDocumentInfo", this.dataFactura.ruc + '/' + this.dataFactura.company)
        }

        if (this.file != null) {
          formData.append("document", this.file)
        }
        this.paymentService.saveOrderPay(formData).subscribe(res => {
          //this.toastr.success("Operación ejecutada con éxito.")
          this.snackBar.open(`Pago Realizado`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          this.dialogRef.close('success')

          this.openSuccess()
          //this.loadPay = false
          //this.ecommerceService.clearStorageLocalProduct()
        }, error => {
          //this.loadPay = false
          //this.errorSevice.getErrorMessage(error)
        })
      } else {
        let send = {
          status: "1"
        }
        this.paymentService.updateStateOrder(this.codeOrder, send).subscribe(res => {


          this.snackBar.open(`Operación ejecutada con exito.`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          this.dialogRef.close('success')

          this.openSuccess()

          //this.loadPay = false
          //this.ecommerceService.clearStorageLocalProduct()
        }, error => {
          //this.loadPay = false
          //this.errorSevice.getErrorMessage(error)
        })
      }

    }

    if (this.typePay == '2') {
      this.creditForm.get('order').setValue(this.codeOrder)
      if (!this.creditForm.valid) {
        //this.toastr.error("Complete los datos para la tarjeta de credito.")
        //this.loadPay = false
        return
      }
      // enctripto
      const regex = / /gi;
      let newObjec = Object.assign({}, this.creditForm.value)
      newObjec.CardNumber = newObjec.CardNumber.replace(regex, '')
      newObjec.CardExpiryDate = newObjec.CardExpiryDate.replace(regex, '')
      //newObjec.BillToEmail = newObjec.BillToEmail.replace(regex, '').toLowerCase()
      /*  let aux = newObjec.CardExpiryDate.split('/')
       let re = aux[0] + aux[1].substring(2, 4)
       newObjec.CardExpiryDate = re */

      console.log("value", newObjec)


      let dataencr = this.criptoService.encryptUsingAES256(newObjec)
      let formData = new FormData()
      formData.append("order", this.codeOrder)
      formData.append("paymentMethod", this.mapPayMethod['2'][0].code)
      formData.append("operationNumber", dataencr)
      formData.append("type", 'W')

      formData.append("new_total", String(this.getTotal()))
      formData.append("points", this._point == null ? '0' : String(this.totalPoints))
      formData.append("coupons", this._coupon == null ? '' : this._coupon.valid ? this._coupon.uniqueCode : '')
      formData.append("discount", String(this.totalDiscount))

      if (this.company.switchDocument == '1' && this.selectedDoc == '1') {
        formData.append("typeDocument", this.selectedDoc)
        formData.append("typeDocumentInfo", this.dataFactura.ruc + '/' + this.dataFactura.company)
      }

      this.paymentService.saveOrderPay(formData).subscribe((res: any) => {
        //this.toastr.success("Operación ejecutada con éxito.")

        if (res.html !== undefined) {
          this.openPayPopup(res.html.webhtml)
          /*  let view = this.viewHtmlPay(res.html.webhtml)
           if (!view) {
             return
           }
           this.openLoadPay() */
        } else {
          this.snackBar.open(`Operación ejecutada con exito.`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          this.dialogRef.close('success')

          this.openSuccess()

        }



      }, error => {

        if (error.status == 409) {
          this.openErrorPay409(error.error.message)
        } else {
          this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }

      })
    }

    if (this.typePay != '1' && this.typePay != '0' && this.typePay != '2') {
      //this.toastr.error("Aun no implementado.")

      return
    }
  }
  /*   viewHtmlPay(html) {
  
      let popupWin = window.open('', '_blank');
      if (popupWin == null || popupWin === undefined) {
        this.openHabilitarVentanaEmergente()
        return false
      }
      popupWin.document.write(html);
      popupWin.document.close();
      return true
  
    } */

  onChange(file: File) {
    if (file) {
      this.file = file;
      //this.formData.get('fileName').setValue(this.file)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        this.imageUrl = reader.result;
      };
    }
  }

  onchangeTypePay() {
    if (this.typePay == '1') {

      if (this.mapPayMethod['1'].length != 0) {
        this.selectedOptionDepo = this.mapPayMethod['1'][0]
      }
      this.ongetListBank()
    }
  }
  openSuccess() {
    let data = {
      title: 'Atención',
      body: `¡Gracias por realizar tu pedido a través de ${this.hostname}, lo hemos recibido exitosamente!`,
      no: null,
      yes: 'ACEPTAR'
    }
    const dialogRef = this.matDialogService.open(DialogCustomComponent, {
      data: data,
      width: "390px",
      disableClose: false
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {
      } else {
      }
    })
  }
  // abrir mensaje de pago realizado
  openLoadPay() {
    const dialogRef = this.matDialogService.open(LoadPayComponent, {
      data: this.codeOrder,
      width: "500px",
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'SUCCESS') {
        this.snackBar.open(`Operación ejecutada con exito.`, '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.dialogRef.close('success')

        this.openSuccess()

      }
    })
  }
  openErrorPay409(message) {
    let data = {
      title: 'Error en el pago',
      body: message,
      no: null,
      yes: 'VOLVER A INTENTAR'
    }
    const dialogRef = this.matDialogService.open(DialogCustomComponent, {
      data: data,
      width: "500px",
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {

      } else {

      }
    })
  }
  openHabilitarVentanaEmergente() {
    let data = {
      title: 'Atención',
      body: 'Por favor, configura tu navegador para que permita ventanas emergentes.',
      no: null,
      yes: 'ACEPTAR'
    }
    const dialogRef = this.matDialogService.open(DialogCustomComponent, {
      data: data,
      width: "500px",
      disableClose: true
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {
      } else {
      }
    })
  }

  openPayPopup(html) {

    const dialogRef = this.matDialogService.open(OpenPayPopupComponent, {
      data: { html: html, price: this.getTotal() },
      width: "500px",
      disableClose: true
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {
      }
      if (result == 'success') {
        this.openLoadPay()
      }
    })
  }

  changeOptionDoc() {
    //this.selectedDoc = e.checked ? '1' : '0'
    this.dataFactura.ruc = ''
    this.dataFactura.company = ''
  }

  calculateTaxed() {
    this.salesTaxt = this.data.tax
    this.total = this.data.total
    this.totalTemp = 0

    //fid
    this.totalDiscount = 0;

    // aqui separo el descuento 
    if (this._coupon != null && this._coupon.valid) {
      if (this._coupon.type == '0' || this._coupon.type == '2') {
        //this.totalDiscount =this.total - Number(this._coupon.value);
        this.totalDiscount = Number(this._coupon.value);
        if (this.totalDiscount <= 0.0) {
          this.totalDiscount = 0.0;
        }
        if (this.totalDiscount > this.total) {
          this.totalDiscount = this.total
        }

        this.salesTaxt = this.salesTaxt - getISVofTotal(this.totalDiscount.toString(), this.company.deliveryTax)
      }
      if (this._coupon.type == '1'){
        this.totalDiscount = this.total*(Number(this._coupon.value)/100);

        if (this.totalDiscount <= 0.0) {
          this.totalDiscount = 0.0;
        }
        if (this.totalDiscount > this.total) {
          this.totalDiscount = this.total
        }
        this.salesTaxt = this.salesTaxt - getISVofTotal(this.totalDiscount.toString(), this.company.deliveryTax)
      }

      // TODO: HACER EL DE PORCENTAJE
    } else {
      //console.log("llege")
      // PUNTOS
      if (this._point != null && this.currentPoints == 0 ||
        this.totalPoints > this.currentPoints) {
        this._point = null;
      }

      if (this._point != null &&
        this.currentPoints > 0 &&
        this.currentPoints >= this.totalPoints) {
        
        var subTO = 0.0;


        // aqui aplico el canje si existe wallet
        var auxPoint = this._wallet ? this._wallet.points : 0
        var auxValue = this._wallet ? Number(this._wallet.value) : 0
        // primero armo cuantos puntos seria mi precio total, si cae decimal l oredondeo al proximo// y ese seria mi total en puntos, casi contrario sol podria reducir puntos y ver cuanto podria pagar con puntos y pagar el resto
        var auxTotPoints = Math.ceil((auxPoint * this.total) / auxValue)
        if (auxTotPoints > this.currentPoints) {
          // significa que hay un resto queno le alcanza
          auxTotPoints = this.currentPoints
  
        }
        if (this.totalPoints == 0) {
          /* this.totalPoints = auxTotPoints
          this.limitPoints = this.totalPoints */
          subTO = (auxValue * auxTotPoints) / auxPoint
        } else {
  
          subTO = (auxValue * this.totalPoints) / auxPoint
  
        }
  
        //this.totalDiscount = this.total - subTO;
        this.totalDiscount = subTO;
  
        if (this.totalDiscount <= 0.0) {
          this.totalDiscount = 0.0;
        }
        if (this.totalDiscount > this.total) {
          this.totalDiscount = this.total
        }
        this.salesTaxt = this.salesTaxt - getISVofTotal(this.totalDiscount.toString(), this.company.deliveryTax)
      
      } else {
        //this.totalDiscount = this.total;
      }
    }

    // SOLO SERA UN AUXILIAR VISUAL NO AFECTARA EN NADA
    if (this.currentPoints > 0 &&
      this.currentPoints >= this.totalPoints) {
      var subTOaux = 0.0;

      // aqui aplico el canje si existe wallet
      var auxPoint = this._wallet ? this._wallet.points : 0
      var auxValue = this._wallet ? Number(this._wallet.value) : 0
      // primero armo cuantos puntos seria mi precio total, si cae decimal l oredondeo al proximo// y ese seria mi total en puntos, casi contrario sol podria reducir puntos y ver cuanto podria pagar con puntos y pagar el resto
      var auxTotPoints = Math.ceil((auxPoint * this.total) / auxValue)
      if (auxTotPoints > this.currentPoints) {
        // significa que hay un resto queno le alcanza
        auxTotPoints = this.currentPoints

      }
      if (this.totalPoints == 0) {

        this.totalPoints = auxTotPoints
        this.limitPoints = this.totalPoints
        subTOaux = (auxValue * auxTotPoints) / auxPoint 
      } else {
        if (this.totalPoints >= auxTotPoints) {
          this.totalPoints = auxTotPoints
          this.limitPoints = this.totalPoints
        }
        subTOaux = (auxValue * this.totalPoints) / auxPoint

      }

      this.viewDiscountPoints = subTOaux

      if (this.viewDiscountPoints <= 0.0) {
        this.viewDiscountPoints = 0.0;
      }
      if (this.viewDiscountPoints > this.total) {
        this.viewDiscountPoints = this.total
      }
    }

    this.totalTemp = this.total - this.totalDiscount
  }


  // INIT FIDELIZATION
  onVerifiedCoupon() {
    if (this._couponText == null || this._couponText == '') {
      return;
    }
    this.ecommerceService.getDataByCupon(this._couponText).subscribe((RES: any) => {
      //console.log(RES)

      if (RES.response == 'success') {
        //this.data.listCupons.push(RES.data)
        if(Number(this.total) < RES.data.minimum_amount){
          this._coupon = new Coupon()
          this._coupon.uniqueCode = ''
          this._coupon.valid = false;
          this._couponMessage = "No se puede aplicar este cupón porque no cumples con los requisitos del valor mínimo de compra."
          this.snackBarService.error({ message: "Cupón no puede ser aplicado" })
        }else if(RES.data.type == '0' || RES.data.type == '1'){
          this._coupon = new Coupon(RES.data)
          this.calculateTaxed();
          this.snackBarService.success({ message: "Cupón aplicado" })
        }else{
          let findProduct = this.data.orderDetail.find(item => item.material_code == RES.data.code_item);
          if(findProduct){
            this._coupon = new Coupon(RES.data)
            this.calculateTaxed();
            this.snackBarService.success({ message: "Cupón aplicado" })
          }else{
            this._coupon = new Coupon()
            this._coupon.uniqueCode = ''
            this._coupon.valid = false;
            this._couponMessage = null
            this.snackBarService.error({ message: "Cupón no puede ser aplicado, producto no encontrado" })
          }
        }
      }
      if (RES.response == 'error') {
        //this._couponText = null
        this._coupon = new Coupon()
        this._coupon.uniqueCode = this._couponText
        this._coupon.valid = false;
        this._couponMessage = null
        this.snackBarService.error({ message: RES.message })
      }

    }, error => {
      this._couponText = null
      this.errorService.getErrorMessage(error)
    })
  }

  onRemoveCoupon() {
    this._coupon = null;
    this._couponText = null;
    this.calculateTaxed();
  }

  onApliyPoints() {
    if (this.totalPoints > this.currentPoints || this.currentPoints == 0) {
      this.snackBarService.error({ message: "No tienes puntos suficientes." })
      return
    }
    this._point = "APLIQUE"
    this.calculateTaxed();
  }

  onRemovePoints() {
    this._point = null;
    this.calculateTaxed();
  }

  onChangeTabFid(num) {
    if (num == 0) {
      /// estoy en cupon
      // solo por siacaso reinicio mis auxiliares
      this.limitPoints = 0;
      this.viewDiscountPoints = 0;
      if (this._point != null) {
        this.onRemovePoints()
      }
    } else {
      if (this._coupon != null) {
        this.onRemoveCoupon()
      }
      // estoy en puntos
    }
  }
  //END FIDELIZATION

  ngOnDestroy() {

    this.obs.forEach(element => {
      element.unsubscribe()
    });

  }
  getTotal() {
    return Number(this.totalTemp) + Number(this.data.priceDelivery)
  }

  getNumber(ele) {
    if (ele) {
      return Number(ele);
    }
    return 0;
  }
}
