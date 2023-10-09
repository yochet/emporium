import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../../theme/utils/app-validators';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  infoForm: FormGroup;
  passwordForm: FormGroup;

  _user = null
  obs: Subscription[] = []

  constructor(public formBuilder: FormBuilder,
    private authService: AuthenticationService,
    public snackBar: MatSnackBar) {
    this.infoForm = this.formBuilder.group({
      'agent': ['', [Validators.required]],
      'identificationDocument': ['', [Validators.pattern("^[0-9]{" + 13 + "}")]],
      'email': ['', [Validators.required, emailValidator]],
      'mobile': ['', [Validators.required, Validators.pattern("^[0-9]{" + 8 + "}")]],
      'phone': ['', [Validators.pattern("^[0-9]{" + 8 + "}")]]
    });

    this.passwordForm = this.formBuilder.group({
      'currentPassword': ['', Validators.required],
      'newPassword': ['', Validators.required],
      'confirmNewPassword': ['', Validators.required]
    }, { validator: matchingPasswords('newPassword', 'confirmNewPassword') });
    this.obs.push(
      this.authService.currentUser.subscribe(res => {
        this._user = res == null ? null : res.user
        if (this._user != null) {
          this.initForm()
        }
      })
    )
  }

  ngOnInit() {

  }

  initForm() {
    this.infoForm.setValue({
      agent: this._user.bp_agent,
      identificationDocument: this._user.bp_identificationDocument,
      email: this._user.email,
      mobile: this._user.bp_mobile,
      phone: this._user.bp_phone,
    });
  }

  public onInfoFormSubmit(values: Object): void {
    if (this.infoForm.valid) {
      this.authService.updateData(this._user.bp_id, this.infoForm.value).subscribe(res => {
        this.authService.updateCurrentUser(res)
        this.snackBar.open('¡La información de tu cuenta se actualizó correctamente!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      }, error => {
        this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      })
    }
  }

  public onPasswordFormSubmit(values: Object): void {
    if (this.passwordForm.valid) {
      let send = {
        email: this._user.email,
        password: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      }
      this.authService.resetPassword(send).subscribe((res) => {

        this.snackBar.open('¡Tu contraseña ha cambiado con éxito!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
      }, error => {
        this.snackBar.open(error.error.message, '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      })



    }
  }
  ngOnDestroy() {
    this.obs.forEach(element => {
      element.unsubscribe()
    });
  }

}
