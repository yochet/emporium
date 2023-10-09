import { Subscription } from 'rxjs';
import { AuthenticationService } from './../../../services/authentication/authentication.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  obs: Subscription[] = []

  _user = null
  constructor(
    private authService: AuthenticationService
  ) {

    this.obs.push(
      this.authService.currentUser.subscribe(res => {
        this._user = res == null ? null : res.user
      })
    )
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.obs.forEach(element => {
      element.unsubscribe()
    });
  }

}
