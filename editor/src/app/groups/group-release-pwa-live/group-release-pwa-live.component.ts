import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { ReleasePwaComponent } from './../release-pwa/release-pwa.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import moment from "moment";

@Component({
  selector: 'app-group-release-pwa-live',
  templateUrl: '../group-release-common/group-release.component.html',
  styleUrls: ['../group-release-common/group-release.component.css']
})
export class GroupReleasePwaLiveComponent implements OnInit {

  title = _TRANSLATE('Release Live Web App')
  breadcrumbs: Array<Breadcrumb> = []
  versionTag = ''
  releaseNotes = ''
  submitted = false
  releaseType = "PWA"
  isPWA = true
  isAPK = false
  @ViewChild('releasePwaComponent', {static: false}) releasePwaComponent:ReleasePwaComponent

  constructor(
    private route:ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Releases'),
        url: 'releases'
      },
      <Breadcrumb>{
        label: _TRANSLATE('Release Live Web App'),
        url: 'releases/release-pwa-live'
      }
    ]
    this.versionTag = moment().format('YYYY-MM-DD-HH-mm-ss')
  }
  submit() {
    if (this.versionTag === '') {
      this.versionTag = moment().format('YYYY-MM-DD-HH-mm-ss')
    }
    this.submitted = true
    this.releasePwaComponent.groupId = this.route.snapshot.paramMap.get('groupId')
    this.releasePwaComponent.releaseType = 'prod'
    this.releasePwaComponent.releaseNotes = this.releaseNotes
    this.releasePwaComponent.versionTag = this.versionTag
    this.releasePwaComponent.releasePWA()
  }
}
