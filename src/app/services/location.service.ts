
import { config, PROVIDER } from './../../environments/config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class LocationService {
  private URL = ''

  constructor(
    private http: HttpClient) {
    this.URL = config.domain
  }


  // locacion
  getCountryCb() {
    const url_api = this.URL + 'api/em/country/get_cb'
    return this.http.get(url_api);
  }
  getDepartmentComboCountry(code) {
    const url_api = this.URL + 'api/em/location_one/get_cb_filter/country/' + code
    return this.http.get(url_api);
  }
  getCityComboDepartment(code) {
    const url_api = this.URL + 'api/em/location_two/get_cb_filter/location_one/' + code
    return this.http.get(url_api);
  }
  getCityCb() {
    const url_api = this.URL + 'api/em/location_two/get_cb' + (PROVIDER.providerId == null ? '' : ('/' + PROVIDER.providerId))
    return this.http.get(url_api);
  }
  getDistrictComboCity(code) {
    const url_api = this.URL + 'api/em/location_three/get_cb_filter/location_two/' + code
    return this.http.get(url_api);
  }

  getValidateActiveCity(code) {
    const url_api = this.URL + 'api/em/location_two/get/' + code
    return this.http.get(url_api);
  }
  //LocationZone
 
  getZonesServerSideByCity(city, VALUE) {

    let params = new HttpParams();
    params = params.append('ltCode', city);
    params = params.append('search', VALUE);

    const url_api = this.URL + 'api/em/location_zone/get_cb_filter/location_two'
    return this.http.get(url_api, {params: params})
  }

  getZoneServerSideOne(id){
    const url_api = this.URL + 'api/em/location_zone/get/'+id
    return this.http.get(url_api)
  }
  onSaveZone(data) {
    const url_api = this.URL + 'api/em/location_zone/set'
    return this.http.post(url_api, data)
  }

  ongetZoneCb(){
    const url_api = this.URL + 'api/em/location_zone/abbreviation/get_cb'
    return this.http.get(url_api);
  }

}