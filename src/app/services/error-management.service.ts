import { SnackBarService} from './snackbar.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ErrorManagementService {

  constructor(
    private snackBarService: SnackBarService
  ) { }

  getErrorMessage(error) {
    if (!navigator.onLine) {
      this.snackBarService.error({ message: "No hay conección a internet" })
    }
    else if (error instanceof ErrorEvent) {
      // client-side error
      this.getClientMessage(error)
    } else {
      // backend error
      this.getServerMessage(error)
    }
  }

  private getClientMessage(error) {
    if (error.error == undefined) {

      this.snackBarService.error({ message: "Error" })
    } else {

      this.snackBarService.error(error.error.message ? error.error.message : error.toString())
    }
  }
  private getServerMessage(error: any) {
    if (error.status == undefined) {
      if (String(error).toLowerCase() == 'jwt expired') {

        this.snackBarService.error({ message: 'Su sesión a expirado' })
      } else {

        this.snackBarService.error({ message: error })
      }

    } else {
      this.snackBarService.error({ message: error.error.message })
    }
  }
}
