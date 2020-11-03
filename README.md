# Chat Application Use Case
initial commit 2020-19-10
> ##  User needs to retrieve lists of users from server.
*  User should contain following properties 
   1. Username 
   1.  Initials 
   1.  State(active or not)

>  ## To request list of users from server, Sever needs to maintain list of users 
>  ## So once user enters to the system/ or once he/she made connection with server they needs to enter user details 

> ## User needs to select partner to chat 
* Needs to validate state of selected partner 
> ## As a user, there should be facility to send a message so that another user gets a notification and sees his message
* Message should contain unique key
* Messages should be stored as a list 

> ## Message should be contain timestamp   
* Timestamp needs to generate in server side so there won’t be any conflicts happens for users those are in different time zones
> ## As a user, there should be way to delete message, once user remove message it  should remove from both parties 
* Each message should contain unique ID 
* Once user click on delete button this message should be delete from sender’s side and message id needs to send to the server-side, It needs to perform delete operation for receiver side as well 


