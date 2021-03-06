import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { UserService } from './../../../core/auth/_services/user.service'
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { AppContext } from 'src/app/app-context.enum';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {

  @ViewChild('container', { static: true }) container:ElementRef
  defaultTemplateIssueTitle = `Issue for \${caseDefinition.name}, by \${userName}`
  defaultTemplateIssueDescription = `` 

  renderedTemplateIssueTitle = ''
  renderedTemplateIssueDescription = ''

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private caseService: CaseService,
    private userService:UserService,
    private formService:TangyFormService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      const caseId = params.caseId
      const eventId = params.eventId
      const eventFormId = params.eventFormId
      const userName = await this.userService.getCurrentUser()
      const userId = userName
      const groupId = window.location.pathname.split('/')[2]
      await this.caseService.load(caseId)
      const caseInstance = this.caseService.case
      const caseDefinition = this.caseService.caseDefinition
      const caseEvent = caseInstance.events.find(caseEvent => caseEvent.id === eventId)
      const caseEventDefinition = this.caseService.caseDefinition.eventDefinitions.find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)
      const eventForm = caseEvent.eventForms.find(eventForm => eventForm.id === eventFormId)
      const eventFormDefinition = caseEventDefinition.eventFormDefinitions.find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
      const formResponse = await this.formService.getResponse(eventForm.formResponseId)
      eval(`this.renderedTemplateIssueTitle = this.caseService.caseDefinition.templateIssueTitle ? \`${this.caseService.caseDefinition.templateIssueTitle}\` : \`${this.defaultTemplateIssueTitle}\``)
      eval(`this.renderedTemplateIssueDescription = this.caseService.caseDefinition.templateIssueDescription ? \`${this.caseService.caseDefinition.templateIssueDescription}\` : \`${this.defaultTemplateIssueDescription}\``)
      if (window.location.hash.split('/').includes('use-templates')) {
        await this.saveIssueAndRedirect(this.renderedTemplateIssueTitle, this.renderedTemplateIssueDescription, caseId, eventId, eventFormId, userId, userName, groupId, false, '')
      } else {
        this.container.nativeElement.innerHTML = `
          <tangy-form id="form" #form>
            <tangy-form-item id="new-issue" title="New Issue">
              <tangy-input
                name="title"
                label="Issue Label"
                inner-label=" "
                value="${this.renderedTemplateIssueTitle}"
                required
              >
              </tangy-input>
              <tangy-input
                name="description"
                label="Issue Description"
                inner-label=" "
                value="${this.renderedTemplateIssueDescription}"
              >
              </tangy-input>
              <tangy-input
                name="case_id"
                label="Case ID"
                value="${caseInstance._id}"
                disabled
              >
              </tangy-input>
              <tangy-input
                name="case_event_id"
                label="Case Event ID"
                value="${caseEvent.id}"
                disabled
              >
              </tangy-input>
              <tangy-input
                name="event_form_id"
                label="Event Form ID"
                value="${eventForm.id}"
                disabled
              >
              </tangy-input>
               <tangy-input
                name="form_response_id"
                label="Form Response ID"
                value="${formResponse._id}"
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
                hint-text="Warning: If you remove this setting later, Devices that have downloaded this Issue will still have it and no longer receive updates on this Issue."
              >
              </tangy-checkbox>
              <tangy-select 
                name="send_to"
                label="Send to..." 
                show-if="getValue('should_send_to')"
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
          await this.saveIssueAndRedirect(issueLabel, issueDescription, caseId, eventId, eventFormId, userId, userName, groupId, sendToAllDevices, sendToDeviceById)
        })
      }
    })
  }

  async saveIssueAndRedirect(title, description, caseId, eventId, eventFormId, userId, userName, groupId, sendToAllDevices, sendToDeviceById) {
    const issue = await this.caseService.createIssue(title, description, caseId, eventId, eventFormId, userId, userName, sendToAllDevices, sendToDeviceById)
    this.router.navigate(['groups', groupId, 'data', 'issues', issue._id])
  }

}
