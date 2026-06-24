import { LightningElement } from 'lwc';
import validateLogin from '@salesforce/apex/LoginController.validateLogin';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LoginPage extends LightningElement {

    employeeId;
    password;

    handleEmployee(event){
        this.employeeId = event.target.value;
    }

    handlePassword(event){
        this.password = event.target.value;
    }

    handleLogin(){

        validateLogin({
            employeeId: this.employeeId,
            password: this.password
        })
        .then(result => {

           if(result){

    this.dispatchEvent(
        new ShowToastEvent({
            title:'Success',
            message:'Login Successful',
            variant:'success'
        })
    );

    setTimeout(() => {
        window.location.href = '/lightning/n/LeaveCrm';
    }, 1500);

}else{

    this.dispatchEvent(
        new ShowToastEvent({
            title:'Error',
            message:'Invalid Credentials',
            variant:'error'
        })
    );
}
        });
    }
}