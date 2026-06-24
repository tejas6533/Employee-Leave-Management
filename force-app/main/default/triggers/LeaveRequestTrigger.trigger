trigger LeaveRequestTrigger on Leave_Request__c (after update) {

    List<Leave_Balance__c> balancesToUpdate = new List<Leave_Balance__c>();

    for(Leave_Request__c lr : Trigger.new){

        Leave_Request__c oldLr = Trigger.oldMap.get(lr.Id);

        if(oldLr.Status__c != 'Approved'
            && lr.Status__c == 'Approved'){

            Leave_Balance__c lb = [
                SELECT Id,
                       Used_Leaves__c
                FROM Leave_Balance__c
                WHERE Employee__c = :lr.Employees__c
                LIMIT 1
            ];

            Integer days =
                lr.Start_Date__c.daysBetween(lr.End_Date__c) + 1;

            lb.Used_Leaves__c =
                (lb.Used_Leaves__c == null ? 0 : lb.Used_Leaves__c) + days;

            balancesToUpdate.add(lb);
        }
    }

    if(!balancesToUpdate.isEmpty()){
        update balancesToUpdate;
    }
}