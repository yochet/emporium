
import { config } from './../../environments/config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class PaymentService {
  private URL = ''
  private URL_PAYMENT = ''

  constructor(
    private http: HttpClient) {
    this.URL = config.domain
    this.URL_PAYMENT = config.domainPayment
  }

  // metodo de pago
  getListPayMethod() {
    const url_api = this.URL + 'api/em/payment_method/get'
    return this.http.get(url_api);
  }
  getListBank() {
    const url_api = this.URL + 'api/em/bank/get'
    return this.http.get(url_api);
  }
  getListTranfersByBank(data) {
    const url_api = this.URL + 'api/em/bank_transfers/get'
    return this.http.post(url_api, data);
  }
  // crear order_pay
  saveOrderPay(data) {
    //data es formData
    const url_api = this.URL_PAYMENT + 'api/em/order_pay/set'
    return this.http.post(url_api, data);
  }
  getLogPayment(code) {
    const url_api = this.URL_PAYMENT + 'api/em/order/log/get/' + code
    return this.http.get(url_api);
  }

  // update state order

  updateStateOrder(code, data) {
    const url_api = this.URL_PAYMENT + 'api/em/order/set_state/' + code
    return this.http.post(url_api, data);
  }

}