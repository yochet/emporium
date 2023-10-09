import { environment } from './../../environments/environment';

import * as CryptoJS from 'crypto-js';

import { Injectable } from '@angular/core';



@Injectable({ providedIn: 'root' })
export class CriptoService {
  tokenFromUI: string = environment.criptoKey;

  constructor() {
    //this.encryptUsingAES256();
  }
  encryptUsingAES256(text: any): string {
    let _key = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
    let _iv = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
    let encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(text), _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }
  decryptUsingAES256(text: string): string {
    let _key = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
    let _iv = CryptoJS.enc.Utf8.parse(this.tokenFromUI);

    let decripte = CryptoJS.AES.decrypt(
      text, _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
    return decripte
  }
}