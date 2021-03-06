import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model';
import {GroupsService} from "../services/groups.service";

@Component({
  selector: 'app-group-device-users',
  templateUrl: './group-device-users.component.html',
  styleUrls: ['./group-device-users.component.css']
})
export class GroupDeviceUsersComponent implements OnInit {
  
  title = _TRANSLATE('Device Users')
  breadcrumbs:Array<Breadcrumb> = []
  excludeColumns = [
    'formId',
    'startUnixtime',
    'endUnixtime',
    'lastSaveUnixtime',
    'groupId',
    'item-1_firstOpenTime',
    'item1_firstOpenTime',
    'complete',
    'deviceId',
    'buildChannel',
    'buildId',
    'tangerineModifiedByUserId'
  ]
  groupId:string

  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private http:HttpClient,
    private groupsService: GroupsService
  ) { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: 'Device Users',
        url: 'device-users'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId
    })
  }

}
