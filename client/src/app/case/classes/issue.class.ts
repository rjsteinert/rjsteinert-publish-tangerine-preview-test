import { AppContext } from './../../app-context.enum';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'

export enum IssueStatus {
  Open='Open',
  Merged='Merged',
  Closed='Closed'
}


export enum IssueEventType {
  Open='Open',
  Close='Close',
  Comment='Comment',
  ProposedChange='ProposedChange',
  UpdateMeta='UpdateMeta',
  Merge='Merge',
  Rebase='Rebase'
}

export class IssueEvent {
  id:string
  type:IssueEventType
  userName:string
  userId:string
  createdAppContext:AppContext
  date:number
  data:any
}

class Issue extends TangyFormResponseModel {
  _id: string
  userId:string
  label:string
  description:string
  tags:Array<string>
  status:IssueStatus
  events:Array<IssueEvent> = []
  caseId:string
  eventId:string
  eventFormId:string
  formResponseId:string
  type:string = 'issue'
  createdOn:number
  createdAppContext:AppContext
  sendToAllDevices:Boolean
  sendToDeviceById:string
  docType:string

  constructor(data?:any) {
    super()
    if (data.type && data.type !== 'issue') throw new Error('Passed in data of the wrong type. Expected an Issue.')
    Object.assign(this, data)
  }

}

export { Issue }
