public with sharing class LoginController {

    @AuraEnabled
    public static Boolean validateLogin(
        String employeeId,
        String password
    ){

        List<Employee_Login__c> users = [
            SELECT Id
            FROM Employee_Login__c
            WHERE Employee_Id__c = :employeeId
            AND Password__c = :password
            LIMIT 1
        ];

        return !users.isEmpty();
    }
}