import { rendererTypeName } from '@angular/compiler';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/auth/_services/user.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model';
import { CaseService } from '../../services/case.service';

@Component({
  selector: 'app-edit-issue',
  templateUrl: './edit-issue.component.html',
  styleUrls: ['./edit-issue.component.css']
})
export class EditIssueComponent implements OnInit {

  @ViewChild('container', { static: true }) container:ElementRef

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private caseService: CaseService,
    private userService:UserService,
    private formService:TangyFormService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      const issueId = params.issueId
      this.render(issueId)
    })
  }

  async render(issueId) {
    const issue = await this.caseService.getIssue(issueId)
    const userName = await this.userService.getCurrentUser()
    const userId = userName
    const groupId = window.location.pathname.split('/')[2]
    const caseInstance = await this.formService.getResponse(issue.caseId) 
    const issueLabel = issue.label
    // Legacy: Look in first event's comment for description.
    const issueDescription = issue.description || issue.events[0].data.comment
    // @TODO Resume Send to..
    this.container.nativeElement.innerHTML = `
      <tangy-form id="form" #form>
        <tangy-form-item id="edit-issue" title="">
          <tangy-input
            name="title"
            label="Issue Label"
            inner-label=" "
            value="${issueLabel}"
            required
          >
          </tangy-input>
          <tangy-input
            name="description"
            label="Issue Description"
            inner-label=" "
            value="${issueDescription}"
          >
          </tangy-input>
          <tangy-input
            name="case_id"
            label="Case ID"
            value="${issue.caseId}"
            disabled
          >
          </tangy-input>
          <tangy-input
            name="case_event_id"
            label="Case Event ID"
            value="${issue.eventId}"
            disabled
          >
          </tangy-input>
          <tangy-input
            name="event_form_id"
            label="Event Form ID"
            value="${issue.eventFormId}"
            disabled
          >
          </tangy-input>
            <tangy-input
            name="form_response_id"
            label="Form Response ID"
            value="${issue.formResponseId}"
            disabled
          >
          </tangy-input>
          <tangy-location
            name="location"
            label="Location"
            value='${JSON.stringify(Object.getOwnPropertyNames(caseInstance.location).map(level => { return { level, value: caseInstance.location[level] } }))}'
            disabled
          >
          </tangy-location>
          <tangy-checkbox
            name="should_send_to"
            label="Send to Devices"
            value="${issue.sendToAllDevices || issue.sendToDeviceById ? 'on' : ''}"
            hint-text="Warning: If you remove this setting later, Devices that have downloaded this Issue will still have it and no longer receive updates on this Issue."
          >
          </tangy-checkbox>
          <tangy-select 
            name="send_to"
            label="Send to..." 
            show-if="getValue('should_send_to')"
            value=${[
              '"', 
              issue.sendToAllDevices ? `all_devices` : '',
              issue.sendToDeviceById ? `device_by_id` : '',
              '"'
            ].join('')}
            required
          >
            <option value="all_devices">All devices</option>
            <option value="device_by_id">Device by ID</option>
          </tangy-select>
          <tangy-input 
            name="device_id"
            label="Device ID"
            inner-label=" "
            show-if="getValue('send_to') === 'device_by_id'"
            value="${issue.sendToDeviceById || ''}"
            required
          >
          </tangy-input>
        </tangy-form-item>
      </tangy-form>
    `
    this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
      event.preventDefault()
      const response = new TangyFormResponseModel(event.target.response)
      const issueLabel = response.inputsByName.title.value
      const issueDescription = response.inputsByName.description.value
      const sendToAllDevices = response.inputsByName.send_to.value === 'all_devices'
        ? true 
        : false
      const sendToDeviceById = response.inputsByName.device_id.value
      const issue = await this.caseService.updateIssueMeta(issueId, issueLabel, issueDescription, sendToAllDevices, sendToDeviceById, userName, userId)
      window.location.reload()
    })
  }

}
