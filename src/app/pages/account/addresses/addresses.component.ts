import { DialogCustomComponent } from './../../../shared/dialog-custom/dialog-custom.component';
import { BpAddressService } from './../../../services/bp-address.service';
import { LocationMapComponent } from './../../../shared/location-map/location-map.component';
import { LocationService } from './../../../services/location.service';
import { AuthenticationService } from './../../../services/authentication/authentication.service';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EcommerceService } from '../../../services/ecommerce.service';
import { config, fromEvent, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddAddressComponent } from '../../../shared/add-address/add-address.component';
import { MatTooltip } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, filter, finalize, find, map, switchMap, tap } from 'rxjs/operators';
import { ErrorManagementService } from 'src/app/services/error-management.service';
import { hourIsLowNow } from 'src/app/theme/utils/time-validator.strategy';
import { PROVIDER } from 'src/environments/config';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tooltip', { static: true }) tooltip: MatTooltip;

  billingForm: FormGroup;
  shippingForm: FormGroup;


  listCountry: any[] = []
  listFilterCountry: any[] = []
  loadCountry = false
  searchCountry = ''

  listDepartment: any[] = []
  listFilterDepartment: any[] = []
  loadDepartment = false
  searchDepartment = ''

  listCity: any[] = []
  listFilterCity: any[] = []
  loadCity = false
  searchCity = ''

  listDistrict: any[] = []
  listFilterDistrict: any[] = []
  loadDistrict = false
  searchDistrict = ''

  //ADDRESS
  listAddress: any = []


  obs: Subscription[] = []
  _user: any = null

  //SERVER-SIDE SELECT
  @ViewChild('inputEle') inputEle: ElementRef;
  searchZoneCtrl = new FormControl();
  filteredZones: any = [];
  isLoading = false;
  errorMsg: string;
  zoneObjectSelected = null;
  searchInit = false
  zonevalidate = false

  aux_field_add: any = []
  enabled_add = false //'0' //permite si hay opción de agregar

  //abreviation
  searchAbrevzone = ''
  listZone: any[] = []
  listFilterZone: any[] = []
  loadZone = false
  searchZone = ''

  constructor(public ecommerceService: EcommerceService, public formBuilder: FormBuilder, public snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private locationService: LocationService,
    private matDialogService: MatDialog,
    private addressService: BpAddressService,
    private errorService: ErrorManagementService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchZoneCtrl.setValidators([Validators.required])
    this.searchZoneCtrl.updateValueAndValidity()

    this.billingForm = this.formBuilder.group({
      country: [null, Validators.required],
      location_one: [null],
      location_two: [null, Validators.required],
      location_three: [null],
      locationZone: [null, Validators.required],
      /*   latitude: [null, Validators.required],
        longitude: [null, Validators.required], */
      latitude: [null],
      longitude: [null],
      address: ['', [Validators.required, Validators.maxLength(250)]],
      reference: ['', [Validators.required, Validators.maxLength(250)]],
    });
    this.obs.push(
      this.authService.currentUser.subscribe(res => {
        this._user = res == null ? null : res.user
      })
    )

  }

  ngOnInit() {
    this.getCountries()
     //this.getZonesAbbreviation() //abbreviation disponible
     this.initForm() // disappear si abbreviation esta disponible
  }

  initForm(){
    if (this._user != null) {
      this.billingForm = this.formBuilder.group({
        country: [this._user.bp_countryCode, Validators.required],
        location_one: [this._user.bp_locationOneCode],
        location_two: [this._user.bp_locationTwoCode, Validators.required],
        location_three: [this._user.bp_locationThreeCode],
        latitude: [this._user.bp_latitude, Validators.required],
        longitude: [this._user.bp_longitude, Validators.required],
        address: [this._user.bp_address, [Validators.required, Validators.maxLength(250)]],
        reference: [this._user.bp_reference, [Validators.required, Validators.maxLength(250)]],
        locationZone: [this._user.bp_locationZoneId, Validators.required],

      });

      //if (this._user.bp_locationOneCode != null) {
      this.getCitys()
      //}
      if (this._user.bp_locationTwoCode != null) {
        this.getDistricts()
      }
      if (this._user.bp_locationZoneId != null) {
        if(this.listZone){
          let abbre = this._user.bp_locationZoneName.split(" ")
          let firstWord = abbre[0]
          let flag = false
          this.listZone.forEach(element => {
            if(element.name == firstWord){
              flag = true
            } 
          });
          if(flag){
            this.searchAbrevzone = firstWord
          }
        }
        let aux_ZoneCtrl = this.getAbbreviation(this._user.bp_locationZoneName)
        this.searchZoneCtrl.setValue(aux_ZoneCtrl)
        this.getZoneById(this._user.bp_locationZoneId)
      }
      this.getListAddress()
    }
  }

  ngAfterViewInit() {
    fromEvent(this.inputEle.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // if character length greater then 2
      //,filter(res => res.length > 2)
      // Time in milliseconds between key events
      , debounceTime(1000)
      // If previous query is diffent from current   
      , distinctUntilChanged()
      // subscription for response
    ).subscribe((text: string) => {
      let newText = this.searchAbrevzone + " " + text 
      this.errorMsg = "";
      this.filteredZones = [];

      //Aqui convertire numeros en texto
      //let res= relpaceNumberByText(text)

      this.isLoading = true;
      this.locationService.getZonesServerSideByCity(this.billingForm.get('location_two').value, newText).subscribe((data: any) => {
        this.isLoading = false;

        if (data.length == 0) {
          this.zoneObjectSelected = null // no encontro por tanlo lo preparo para que no muestre nada
          this.errorMsg = "No se encontraron resultados"
          this.filteredZones = [];
        } else {
          this.errorMsg = "";
          this.filteredZones = data;
        }
        //esto es falso para lc y church para promociones
        this.searchInit = true // esto lo colocare para ver si el boton lo muestro o no

        console.log(this.filteredZones);
      }, error => {
        this.isLoading = false;
        this.errorService.getErrorMessage(error)
      });
    });
  }
  public displayProperty(value) {
    if (value) {
      //this.billingForm.get("locationZone").setValue(value.id)
      return value.name;
    }
  }
  onSelectZone(event) {
    this.zonevalidate = false
    this.billingForm.get("locationZone").setValue(event.option.value.id)
    let aux_zone = this.getAbbreviation(event.option.value.name);
    this.searchZoneCtrl.setValue(aux_zone)
    this.zoneObjectSelected = event.option.value
  }

  public onBillingFormSubmit(values: Object): void {

    if (!this.zoneObjectSelected || this.zoneObjectSelected.bp_locationZoneDelete == '1') {
      if(this.searchZoneCtrl.value){
        const expRegular = /(\s{2,})/g;
        if(this.filteredZones){
          this.filteredZones.forEach(element => {
            let auxName = element.name.replace(expRegular,' ')
            if(auxName == this.searchZoneCtrl.value){
              this.snackBar.open(`Debe seleccionar la zona ${element.name}`, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
            }
          });
          this.zonevalidate = true
          this.searchZoneCtrl.setValue('')
        }else{
          this.snackBar.open(`Debe seleccionar una zona`, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
        this.zoneObjectSelected = null
        return
      }else{
        this.snackBar.open('No existe una zona disponible', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        return
      }
    }

    if (this.billingForm.get('country').invalid || this.billingForm.get('location_two').invalid || this.billingForm.get('address').invalid || this.billingForm.get("locationZone").invalid) {
      return
    }

    /* if (this.billingForm.get('latitude').invalid || this.billingForm.get('longitude').invalid || this.billingForm.get('longitude').value == '0.0' || this.billingForm.get('longitude').value == '') {
      this.tooltip.show()
      return
    } */

    /* abbreviation disponible
    if(!this.searchAbrevzone){
      this.snackBar.open(`Debe seleccionar la abreviación`, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      return
    }*/

    if (this.billingForm.get('reference').invalid) {
      return
    }
    /*if (!this.zoneObjectSelected) {
      this.snackBar.open('No existe una zona disponible', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      return
    }*/
    if (this.zoneObjectSelected.active == "2") {
      this.snackBar.open('Zona fuera de cobertura', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      return
    }
    if (hourIsLowNow(this.zoneObjectSelected.hourAttention)) {
      this.snackBar.open('En este momento no tenemos cobertura en tu zona', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      return
    }

    if (this.billingForm.valid) {
      this.authService.updateData(this._user.bp_id, this.billingForm.value).subscribe(res => {
        this.authService.updateCurrentUser(res)
        this.snackBar.open('¡La información de su dirección de facturación se actualizó correctamente!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      }, error => {
        this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      })
    }
  }

  // START LOCATION
  getCountries() {
    this.loadCountry = true
    this.locationService.getCountryCb().subscribe((data: any) => {
      this.listCountry = data
      this.listFilterCountry = this.listCountry.slice()
      if (this.listCountry.length == 1) {
        this.billingForm.get('country').setValue(this.listCountry[0].code)
        this.getDepartments()
      }
      this.loadCountry = false
    },
      error => {
        this.loadCountry = false
        //this.errorService.getErrorMessage(error)
      })
  }
  changueOptionsCountry(event) {
    if (!this.listCountry) {
      return;
    }
    let search = event;
    if (!search) {
      this.listFilterCountry = this.listCountry.slice();
      return;
    } else {
      search = search.toLowerCase();
    }
    this.listFilterCountry = this.listCountry.filter(item => item.name.toLowerCase().indexOf(search) > -1)
  }

  // por pais
  getDepartments() {
    this.loadDepartment = true
    this.locationService.getDepartmentComboCountry(this.billingForm.value.country).subscribe((data: any) => {
      this.listDepartment = data
      this.listFilterDepartment = this.listDepartment.slice()
      this.loadDepartment = false
    },
      error => {
        this.loadDepartment = false

        //this.errorService.getErrorMessage(error)
      })
  }
  changueOptionsDepartment(event) {
    if (!this.listDepartment) {
      return;
    }
    let search = event;
    if (!search) {
      this.listFilterDepartment = this.listDepartment.slice();
      return;
    } else {
      search = search.toLowerCase();
    }
    this.listFilterDepartment = this.listDepartment.filter(item => item.name.toLowerCase().indexOf(search) > -1)
  }

  // por departamento
  /*   getCitys() {
      this.loadCity = true
      this.locationService.getCityComboDepartment(this.billingForm.value.location_one).subscribe((data: any) => {
        this.listCity = data
        this.listFilterCity = this.listCity.slice()
        this.loadCity = false
      },
        error => {
          this.loadCity = false
  
          //this.errorService.getErrorMessage(error)
        })
    }
    changueOptionsCity(event) {
      if (!this.listCity) {
        return;
      }
      let search = event;
      if (!search) {
        this.listFilterCity = this.listCity.slice();
        return;
      } else {
        search = search.toLowerCase();
      }
      this.listFilterCity = this.listCity.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    } */

  // SOLO LISTA DE CIDUADES
  getCitys() {
    this.loadCity = true
    this.locationService.getCityCb().subscribe((data: any) => {
      this.listCity = data
      this.aux_field_add = data
      this.getCityZone(this._user.bp_locationTwoCode)
      this.listFilterCity = this.listCity.slice()
      this.loadCity = false
    },
      error => {
        this.loadCity = false
        //this.errorService.getErrorMessage(error)
      })
  }
  changueOptionsCity(event) {
    if (!this.listCity) {
      return;
    }
    let search = event;
    if (!search) {
      this.listFilterCity = this.listCity.slice();
      return;
    } else {
      search = search.toLowerCase();
    }
    this.listFilterCity = this.listCity.filter(item => item.name.toLowerCase().indexOf(search) > -1)
  }


  // por ciudad
  getDistricts() {
    this.loadDistrict = true
    this.locationService.getDistrictComboCity(this.billingForm.value.location_two).subscribe((data: any) => {
      this.listDistrict = data
      this.listFilterDistrict = this.listDistrict.slice()
      this.loadDistrict = false
    },
      error => {
        this.loadDistrict = false

        //this.errorService.getErrorMessage(error)
      })
  }
  changueOptionsDistrict(event) {
    if (!this.listDistrict) {
      return;
    }
    let search = event;
    if (!search) {
      this.listFilterDistrict = this.listDistrict.slice();
      return;
    } else {
      search = search.toLowerCase();
    }
    this.listFilterDistrict = this.listDistrict.filter(item => item.name.toLowerCase().indexOf(search) > -1)
  }

  onChangeCountry() {
    this.billingForm.get('location_one').setValue(null)
    this.listDepartment = []
    this.listFilterDepartment = []
    this.billingForm.get('location_two').setValue(null)
    this.listCity = []
    this.listFilterCity = []
    this.billingForm.get('location_three').setValue(null)
    this.listDistrict = []
    this.listFilterDistrict = []
    this.getDepartments()
  }
  onChangeDepartment() {
    this.billingForm.get('location_two').setValue(null)
    this.listCity = []
    this.listFilterCity = []
    this.billingForm.get('location_three').setValue(null)
    this.listDistrict = []
    this.listFilterDistrict = []
    this.getCitys()
  }
  onChangeCitys() {
    this.billingForm.get('location_three').setValue(null)
    this.listDistrict = []
    this.listFilterDistrict = []

    this.filteredZones = []
    this.zoneObjectSelected = null
    this.searchZoneCtrl.setValue(null)
    this.billingForm.get('locationZone').setValue(null)

    this.getDistricts()
    this.getCityZone(this.billingForm.value.location_two)
    // busco la ciudad y seteo el departamento
    let findc = this.listCity.find(res => res.code == this.billingForm.get('location_two').value)
    if (findc) {
      this.billingForm.get('location_one').setValue(findc.location_one.code)
    }
  }

  openMap() {
    //analizar pais y ciudad
    let data = {
      country: (this.billingForm.get('country').value == null || this.billingForm.get('country').value == '') ? null : this.getNameCountry(),
      dep: (this.billingForm.get('location_one').value == null || this.billingForm.get('location_one').value == '') ? null : this.getNameDepartment(),
      city: (this.billingForm.get('location_two').value == null || this.billingForm.get('location_two').value == '') ? null : this.getNameCity(),
      location_three: (this.billingForm.get('location_three').value == null || this.billingForm.get('location_three').value == '') ? null : this.getNameDistrict(),
      address: this.billingForm.value.address, // TODO: CONCATENAR EL PAIZ PARA REALIZAR LA BUSQUEDA
      latitude: this.billingForm.value.latitude,
      longitude: this.billingForm.value.longitude
    }


    let addres = this.billingForm.get('address').value

    const dialogRef = this.matDialogService.open(LocationMapComponent, {

      data: data,
      disableClose: true,
      width: '900px',
      panelClass: 'location-dialog',
      //direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === undefined || result == "Close") {
      } else {
        console.log(result)
        this.billingForm.get('latitude').setValue(String(result.latitude))
        this.billingForm.get('longitude').setValue(String(result.longitude))
        //if (addres == null || addres == '') {
        this.billingForm.get('address').setValue(result.address)
        //}
      }
    });
  }

  getNameCountry() {
    let res = this.listCountry.find(element => {
      return element.code === this.billingForm.value.country
    })
    if (res) {
      return res.name
    } else {
      return ''
    }
  }

  getNameDepartment() {
    let res = this.listDepartment.find(element => {
      return element.code === this.billingForm.value.location_one
    })
    if (res) {
      return res.name
    } else {
      return ''
    }
  }
  getNameCity() {
    let res = this.listCity.find(element => {
      return element.code === this.billingForm.value.location_two
    })
    if (res) {
      return res.name
    } else {
      return ''
    }
  }
  getNameDistrict() {
    let res = this.listDistrict.find(element => {
      return element.code === this.billingForm.value.location_three
    })
    if (res) {
      return res.name
    } else {
      return ''
    }
  }
  // END LOCATION

  getListAddress() {
    this.addressService.getAddresByBpCb().subscribe(data => {
      this.listAddress = data

    })
  }

  openNewAddress(element) {
    const dialogRef = this.matDialogService.open(AddAddressComponent, {
      data: element,
      width: "900px",
      disableClose: true,
      panelClass: 'address-dialog',
      //direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'close' || result == undefined) {

      } else {
        //this.addressId = result.id
        this.getListAddress()
      }
    })
  }
  openDeleteAddress(ele) {
    const dialogRef = this.matDialogService.open(DialogCustomComponent, {
      data: {
        title: 'Eliminar Dirección',
        body: '¿Estas seguro de eliminar esta direccion?',
        no: 'No',
        yes: 'Si'
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
          this.addressService.deleteAddresByBp(ele.id).subscribe(res => {
            this.snackBar.open("Se elimino correctamente", '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
            this.billingForm.get('addressId').setValue(null)
            this.getListAddress()
          }, error => {
            this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
          })
        }
      }
    })
  }

  openConfirmAddZone() {
    //let text=  this.searchZoneCtrl.value

    if (this.billingForm.value.location_two == null || this.billingForm.value.location_two == '') {
      this.snackBar.open("Por favor selecciona una ciudad.", '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      return
    }


    const dialogRef = this.matDialogService.open(DialogCustomComponent, {
      data: {
        title: 'Agregar Nueva Zona',
        body: 'Solicitud sujeta a verificación, si es aprobada podrás realizar pedidos para esta dirección. ¿Deseas continuar?',
        no: 'No',
        yes: 'Si'
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
          this.locationService.onSaveZone({
            name: this.searchZoneCtrl.value,  // abbreviation disponible this.searchAbrevzone + " " + this.searchZoneCtrl.value,
            locationTwo: this.billingForm.value.location_two,
            bpProvider: PROVIDER.providerId
          }).subscribe((res: any) => {
            this.snackBar.open("Se agregó correctamente", '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
            this.zoneObjectSelected = res
            this.zonevalidate = false
            this.billingForm.get('locationZone').setValue(res.id)
            this.searchZoneCtrl.setValue(res.name)
          }, error => {
            this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
          })
        }
      }
    })
  }
  getZoneById(id) {
    this.locationService.getZoneServerSideOne(id).subscribe(res => {
      this.zoneObjectSelected = res
      this.zoneObjectSelected['bp_locationZoneDelete'] = this.zoneObjectSelected.idDelete ?  this.zoneObjectSelected.idDelete : this._user.bp_locationZoneDelete
    }, error => {
      this.errorService.getErrorMessage(error)
    })
  }

  getCityZone(element){
    for(let item of this.aux_field_add){
      if(item.code == element){
        //this.enabled_add = item.can_add_zone
        if(item.can_add_zone == '1'){
          this.enabled_add = true
        }else{
          this.enabled_add = false
        }
        break;
      }
    }
  }

  getZonesAbbreviation() {
    this.loadZone = true
    this.locationService.ongetZoneCb().subscribe((data: any) => {
      this.listZone = data
      this.listFilterZone = this.listZone.slice()
      this.initForm()
      this.loadZone = false
    },
    error => {
      this.loadZone = false
      this.errorService.getErrorMessage(error)
    })
  }

  changueOptionsZone(event) {
    if (!this.listZone) {
      return;
    }
    let search = event;
    if (!search) {
      this.listFilterZone = this.listZone.slice();
      return;
    } else {
      search = search.toLowerCase();
    }
    this.listFilterZone = this.listZone.filter(item => item.name.toLowerCase().indexOf(search) > -1)
  }

  onChangeAbbreviation(){
    this.filteredZones = []
    this.zoneObjectSelected = null
    this.searchZoneCtrl.setValue(null)
    this.billingForm.get('locationZone').setValue(null)
  }

  getAbbreviation(data){
    let newZone = ""
    if(this.listZone){
      let abbre = data.split(" ")
      let firstWord = abbre[0]
      let flag = false
      this.listZone.forEach(element => {
        if(element.name == firstWord){
          flag = true
        } 
      });
      if(flag){
        let pos = data.indexOf(" ")
        let nameLocation = ""
        if(pos != -1){
          nameLocation = data.substring(pos+1, data.length)
          newZone  = nameLocation
        }
      }else{
        newZone = data
      }
    }
    return newZone
  }

  ngOnDestroy() {
    this.obs.forEach(element => {
      element.unsubscribe()
    });
  }
}
