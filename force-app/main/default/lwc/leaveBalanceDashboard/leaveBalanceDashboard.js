import { LightningElement, wire } from 'lwc';
import getLeaveBalances from '@salesforce/apex/LeaveController.getLeaveBalances';

const columns = [
    { label:'Employee', fieldName:'employeeName'},
    { label:'Total', fieldName:'Total_Leaves__c'},
    { label:'Used', fieldName:'Used_Leaves__c'},
    { label:'Remaining', fieldName:'Remaining_Leaves__c'}
    //{ label:'Department', fieldName:'Employee__r.Department__c'}
];

export default class LeaveBalanceDashboard extends LightningElement {

    columns = columns;
    balances = [];

    @wire(getLeaveBalances)
    wiredBalances({data,error}){

        if(data){

            this.balances = data.map(row => ({
                ...row,
                employeeName: row.Employee__r.Name
            }));
        }
    }
}