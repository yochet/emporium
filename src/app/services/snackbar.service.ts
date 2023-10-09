import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {


  constructor(private snackBar: MatSnackBar) {

  }
  error(options: { message: string, vertical?: MatSnackBarVerticalPosition, horizontal?: MatSnackBarHorizontalPosition, duration?: number }) {
    this.snackBar.open(options.message, '×', { panelClass: 'error', verticalPosition: options.vertical ? options.vertical : 'top', horizontalPosition: options.horizontal ? options.horizontal : 'center', duration: options.duration ? options.duration : 3000 });
  }
  success(options: { message: string, vertical?: MatSnackBarVerticalPosition, horizontal?: MatSnackBarHorizontalPosition, duration?: number }) {
    this.snackBar.open(options.message, '×', { panelClass: 'success', verticalPosition: options.vertical ? options.vertical : 'top', horizontalPosition: options.horizontal ? options.horizontal : 'center', duration: options.duration ? options.duration : 3000 });
  }
  info(options: { message: string, vertical?: MatSnackBarVerticalPosition, horizontal?: MatSnackBarHorizontalPosition, duration?: number }) {
    this.snackBar.open(options.message, '×', { panelClass: 'info', verticalPosition: options.vertical ? options.vertical : 'top', horizontalPosition: options.horizontal ? options.horizontal : 'center', duration: options.duration ? options.duration : 3000 });
  }



}