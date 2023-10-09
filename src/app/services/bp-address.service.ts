
import { config } from './../../environments/config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({ providedIn: 'root' })
export class BpAddressService {
  private URL = ''

  constructor(
    private http: HttpClient) {
    this.URL = config.domain
  }


  getAddresByBp() {
    const url_api = this.URL + 'api/em/business_partner_address/get'
    return this.http.get(url_api);
  }
  getAddresByBpCb() {
    const url_api = this.URL + 'api/em/business_partner_address/get_cb'
    return this.http.get(url_api);
  }
  setAddresByBp(data) {
    const url_api = this.URL + 'api/em/business_partner_address/set'
    return this.http.post(url_api, data);
  }
  updateAddresByBp(id, data) {
    const url_api = this.URL + 'api/em/business_partner_address/put/' + id
    return this.http.put(url_api, data);
  }
  deleteAddresByBp(id) {
    const url_api = this.URL + 'api/em/business_partner_address/delete/' + id
    return this.http.delete(url_api);
  }

  // STORE
  onValidateStore(data) {
    const url_api = this.URL + 'api/em/store/validate_store_time/'
    return this.http.post(url_api, data);
  }

  //INFO_PANIC
  onValidateEmergencyPanic(data) {
    const url_api = this.URL + 'api/em/store/get_emergency_info/'
    return this.http.post(url_api, data);
  }

}