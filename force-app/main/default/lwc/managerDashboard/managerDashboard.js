import { LightningElement, wire } from 'lwc';
import getPendingRequests from '@salesforce/apex/LeaveController.getPendingRequests';
import updateStatus from '@salesforce/apex/LeaveController.updateStatus';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label:'Approve', name:'Approve'},
    { label:'Reject', name:'Reject'}
];

const columns = [
    { label:'Employee', fieldName:'employeeName'},
    { label:'Leave Type', fieldName:'Leave_Type__c'},
    { label:'Status', fieldName:'Status__c'},
    {
        type:'action',
        typeAttributes:{ rowActions: actions }
    }
];

export default class ManagerDashboard extends LightningElement {

    columns = columns;
    records;
    wiredResult;

    @wire(getPendingRequests)
wiredRequests(result) {

    this.wiredResult = result;

    if (result.data) {

        this.records = result.data.map(row => ({
            ...row,
            employeeName: row.Employees__r
                ? row.Employees__r.Name
                : 'No Employee'
        }));

        console.log('Records:', this.records);
    }

    if (result.error) {
        console.error('Error:', result.error);
    }
}
handleRowAction(event){

    const action = event.detail.action.name;
    const row = event.detail.row;

    const statusValue =
        action === 'Approve'
        ? 'Approved'
        : 'Rejected';

    updateStatus({
        leaveId: row.Id,
        status: statusValue
    })
    .then(() => {

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Leave Request ' + statusValue,
                variant: 'success'
            })
        );

        return refreshApex(this.wiredResult);
    })
    .catch(error => {

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            })
        );

        console.error(error);
    });
}
}