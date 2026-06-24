import { LightningElement } from 'lwc';
import saveLeaveRequest from '@salesforce/apex/LeaveController.saveLeaveRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LeaveRequestForm extends LightningElement {

    employeeId;
    leaveType;
    startDate;
    endDate;
    reason;

    leaveOptions = [
        { label: 'Casual Leave', value: 'Casual Leave' },
        { label: 'Sick Leave', value: 'Sick Leave' },
        { label: 'Paternity Leave', value: 'Paternity Leave' },
        { label: 'Work From Home', value: 'Work From Home' },
        { label: 'Maternity Leave', value: 'Maternity Leave' }
    ];

    handleEmployee(event) {
        this.employeeId = event.target.value;
    }

    handleLeaveType(event) {
        this.leaveType = event.target.value;
    }

    handleStartDate(event) {
        this.startDate = event.target.value;
    }

    handleEndDate(event) {
        this.endDate = event.target.value;
    }

    handleReason(event) {
        this.reason = event.target.value;
    }

    submitLeave() {
        saveLeaveRequest({
            employeeId: this.employeeId,
            leaveType: this.leaveType,
            startDate: this.startDate,
            endDate: this.endDate,
            reason: this.reason
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Leave Request Created',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.error('Error:', error);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || 'Something went wrong',
                    variant: 'error'
                })
            );
        });
    }
}