import { UserService } from './../../../shared/_services/user.service';
import { SyncService } from './../../sync.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReplicationStatus} from "../../classes/replication-status.class";

const STATUS_INITIAL = 'STATUS_INITIAL'
const STATUS_IN_PROGRESS = 'STATUS_IN_PROGRESS'
const STATUS_COMPLETED = 'STATUS_COMPLETED'
const STATUS_ERROR = 'STATUS_ERROR'

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit, OnDestroy {

  status = STATUS_INITIAL
  syncMessage: any
  direction: any
  checkpointMessage: any
  diffMessage: any
  startNextBatchMessage: any
  pendingBatchMessage: any
  otherMessage: any
  subscription: any
  show:boolean=false;
  dbDocCount:number
  replicationStatus: ReplicationStatus
  errorMessage: any
  pullError: any
  pushError: any

  constructor(
    private syncService: SyncService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.syncMessage = ''
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.otherMessage = ''
    this.errorMessage = ''
  }

  async sync() {
    this.syncMessage = ''
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.otherMessage = ''
    this.status = STATUS_IN_PROGRESS
    this.errorMessage = ''
    this.pullError = ''
    this.pushError = ''
    const lock =  await navigator['wakeLock'].request('screen');
    this.subscription = this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        if (progress) {
          let pendingMessage = ''
          if (typeof progress.message !== 'undefined') {
            this.otherMessage = progress.message
          } else {
            this.otherMessage = ''
          }
          if (typeof progress.pending !== 'undefined') {
            pendingMessage = progress.pending + ' pending;'
          }
          if (typeof progress.error !== 'undefined') {
            this.errorMessage = progress.error
          }
          if (typeof progress.pullError !== 'undefined') {
            this.pullError = progress.pullError
          }
          if (typeof progress.pushError !== 'undefined') {
            this.pushError = progress.pushError
          }
          if (typeof progress.remaining !== 'undefined' && progress.remaining !== null) {
            this.syncMessage = progress.remaining + '% remaining to sync '
          }

          if (progress.direction !== '') {
            this.direction = 'Direction: ' + progress.direction
          }
          // console.log('Sync Progress: ' + JSON.stringify(progress))
        }
        
      }
    })
    try {
      await this.syncService.sync()
      this.replicationStatus = this.syncService.replicationStatus
      const userDb = await this.userService.getUserDatabase()
      this.dbDocCount = (await userDb.db.info()).doc_count
      this.status = STATUS_COMPLETED
      this.subscription.unsubscribe();
    } catch (e) {
      // console.log('Sync Error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)))
      // console.trace()
      console.log(e)
      const userDb = await this.userService.getUserDatabase()
      this.dbDocCount = (await userDb.db.info()).doc_count
      this.status = STATUS_ERROR
      this.syncMessage = this.syncMessage + ' ERROR: ' + JSON.stringify(e.message)
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  toggle() {
    this.show = !this.show
  }

}
