import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable() 
export class CustomOverlayContainer extends OverlayContainer {
  override _createContainer(): void {
    let container = document.createElement('div');
    container.classList.add('cdk-overlay-container');
    const app = document.getElementById('app');
    if (!app) return;
    app.appendChild(container);
    this._containerElement = container;
  }
}