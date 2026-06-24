public with sharing class LeaveController {
    
    @AuraEnabled
    public static void saveLeaveRequest(
        Id employeeId,
        String leaveType,
        Date startDate,
        Date endDate,
        String reason
    ){
        
        Leave_Request__c lr = new Leave_Request__c();
        
        lr.Employees__c = employeeId;
        lr.Leave_Type__c = leaveType;
        lr.Start_Date__c = startDate;
        lr.End_Date__c = endDate;
        lr.Reason__c = reason;
        lr.Status__c = 'Pending';
        
        insert lr;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Leave_Request__c> getLeaveRequests(){
        
        return [
            SELECT Id,
            Leave_Type__c,
            Start_Date__c,
            End_Date__c,
            Status__c
            FROM Leave_Request__c
            ORDER BY CreatedDate DESC
        ];
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Leave_Request__c> getPendingRequests(){
        
        return [
            SELECT Id,Employees__c,
            Employees__r.Name,
            Leave_Type__c,
            Status__c
            FROM Leave_Request__c
            WHERE Status__c='Pending'
        ];
    }
    
    @AuraEnabled
public static void updateStatus(Id leaveId, String status){

    Leave_Request__c lr = [
        SELECT Id,
               Status__c,
               Start_Date__c,
               End_Date__c,
               Employees__c
        FROM Leave_Request__c
        WHERE Id = :leaveId
        LIMIT 1
    ];

    // Check leave balance before approval
    if(status == 'Approved'){

         String conflictMsg = checkLeaveConflict(leaveId);

        if(conflictMsg != 'No Conflict'){
            throw new AuraHandledException(conflictMsg);
        }

        Integer leaveDays =
            lr.Start_Date__c.daysBetween(lr.End_Date__c) + 1;

        Leave_Balance__c lb = [
            SELECT Id,
                   Remaining_Leaves__c
            FROM Leave_Balance__c
            WHERE Employee__c = :lr.Employees__c
            LIMIT 1
        ];

        if(lb.Remaining_Leaves__c < leaveDays){
            throw new AuraHandledException(
                'Insufficient Leave Balance'
            );
        }
    }

    // Update Status
    lr.Status__c = status;
    update lr;

    // Send Email
    Employee__c emp = [
        SELECT Id,
               Name,
               Email__c
        FROM Employee__c
        WHERE Id = :lr.Employees__c
        LIMIT 1
    ];

    String subject;
    String body;

    if(status == 'Approved'){

        subject = 'Leave Request Approved';

        body =
            'Hello ' + emp.Name +
            ',\n\nYour leave request has been approved.' +
            '\n\nThank You';

    }else if(status == 'Rejected'){

        subject = 'Leave Request Rejected';

        body =
            'Hello ' + emp.Name +
            ',\n\nYour leave request has been rejected.' +
            '\n\nThank You';
    }

    Messaging.SingleEmailMessage mail =
        new Messaging.SingleEmailMessage();

    mail.setToAddresses(
        new String[]{emp.Email__c}
    );

    mail.setSubject(subject);

    mail.setPlainTextBody(body);

    Messaging.sendEmail(
        new Messaging.SingleEmailMessage[]{mail}
    );
}
    
    
    @AuraEnabled(cacheable=true)
public static List<Leave_Balance__c> getLeaveBalances(){

    return [
        SELECT Id,
               Employee__r.Name,
               Total_Leaves__c,
               Used_Leaves__c,
               Remaining_Leaves__c
        FROM Leave_Balance__c
    ];
}

@AuraEnabled
public static String checkLeaveConflict(Id leaveId){

    Leave_Request__c currentLeave = [
        SELECT Id,
               Employees__c,
               Employees__r.Department__c,
               Start_Date__c,
               End_Date__c
        FROM Leave_Request__c
        WHERE Id = :leaveId
    ];

    List<Leave_Request__c> conflicts = [
        SELECT Id
        FROM Leave_Request__c
        WHERE Status__c = 'Approved'
        AND Employees__r.Department__c =
            :currentLeave.Employees__r.Department__c
        AND Id != :leaveId
        AND Start_Date__c <= :currentLeave.End_Date__c
        AND End_Date__c >= :currentLeave.Start_Date__c
    ];

    if(conflicts.size() >= 2){
        return 'Warning: ' + conflicts.size() +
               ' employees from same department are already on leave.';
    }

    return 'No Conflict';
}
}