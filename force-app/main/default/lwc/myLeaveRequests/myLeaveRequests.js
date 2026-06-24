import { LightningElement, wire } from 'lwc';
import getLeaveRequests from '@salesforce/apex/LeaveController.getLeaveRequests';

const columns = [
    { label: 'Leave Type', fieldName: 'Leave_Type__c' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date' },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date' },
    { label: 'Status', fieldName: 'Status__c' }
];

export default class MyLeaveRequests extends LightningElement {

    columns = columns;
    leaveRequests = [];
    error;

    @wire(getLeaveRequests)
    wiredLeaveRequests({ data, error }) {

        if (data) {
            console.log('Data Received:', data);
            this.leaveRequests = data;
            this.error = undefined;
        }
        else if (error) {
            console.error('Wire Error:', error);
            this.error = error;
            this.leaveRequests = [];
        }
    }
}