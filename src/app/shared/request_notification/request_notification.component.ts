import { PROVIDER } from 'src/environments/config';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ms-request_notification',
  templateUrl: './request_notification.component.html',
  styleUrls: ['./request_notification.component.scss']
})
export class RequestNotificationComponent implements OnInit {

  name = PROVIDER.providerName

  constructor(public dialogRef: MatDialogRef<RequestNotificationComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  ngOnInit() {
  }

  // yes method is used to close the delete dialog and send the response "yes".
  yes() {
    this.dialogRef.close("yes");
  }
  no() {
    this.dialogRef.close("no");
  }
}