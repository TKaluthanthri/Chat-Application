"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

const project = {

    cons (ada)

    receiveMessage: function (msg) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = user + " says " + msg;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
    }
};



//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;

const singnalRAdaptor = {

    connection.on("ReceiveMessage", function (user, message) {
        project.receiveMessage(message);
    });

    connection.start().then(function () {
        document.getElementById("sendButton").disabled = false;
    }).catch(function (err) {
        return console.error(err.toString());
    });

    document.getElementById("sendButton").addEventListener("click", function (event) {
        var user = document.getElementById("userInput").value;
        var message = document.getElementById("messageInput").value;
        connection.invoke("SendMessage", user, message).catch(function (err) {
            return console.error(err.toString());
        });
        event.preventDefault();
    });
}