"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
var selecteduserName;
var currentUser;
var isDeleted = false;
var connectionSender;
var connectionReceiver;

const messageFrom = get(".msger-inputarea");
const messageInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const BOT_IMG = "https://image.flaticon.com/icons/svg/145/145866.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;



connection.on("ReceiveLog", function (data) {
    return console.log("LOG", data);
});

connection.on("ReceiveMessage", function (messageReceiver, messageSender, message, timestamp, isDeleted,messageId) {
    var sentDate = new Date(timestamp).toString()
    var index = sentDate.lastIndexOf(':') + 3
    var DeliveredTime = sentDate.substring(0, index); 
   
    if (!isDeleted) {
        appendMessage(messageSender, BOT_IMG, "right", message, messageId);
    }
    else
    {
        //remove message from recervers side  
        //update local storage as well 
        var retrievedObject = localStorage.getItem(messageId);
        var tempObject = JSON.parse(retrievedObject);
        var list = document.getElementsByClassName("msg-text");
        for (var item of list)
        {
            if (item.id == messageId) {
                item.innerText = "this message was deleted by user";
                break;
            }   
        }
    }
    console.log("Receiver:", messageReceiver);
    console.log("MESSAGE", encodedMsg);
});

connection.on("MessageSent", function (messageId, timestamp, message, messageReceiver) {

    var key = messageId;
    //convert time --2020-09-18T14:55:44.3721628+05:30 to readable format
    var sentDate = new Date(timestamp).toString()
    var index = sentDate.lastIndexOf(':') + 3
    var messageSentTime = sentDate.substring(0, index);


    var messageContent = {
        MessageId: messageId,
        Content: message,
        DeliveredTime: messageSentTime
    };

    var value = JSON.stringify(messageContent);
    localStorage.setItem(key, value);

    appendMessage(connection.userName, PERSON_IMG, "left", message, messageId);
    messageInput.value = "";

    //var retrievedObject = localStorage.getItem(`Chat_${messageSender}_${messageReceiver}`);
    console.log('storedObject: ', JSON.parse(messageContent));
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    console.log("SignalR Connected...");
}).catch(function (err) {
    return console.error(err.toString());
});

messageFrom.addEventListener("submit", event => {
    event.preventDefault();

    var messageReceiver = document.getElementById("selectedUsername").value;
    const message = messageInput.value;

   // const message = document.getElementById("messageInput").value;
    isDeleted = false;
    var Id = "";

    if (!message) return;

    connection.invoke("SendMessage", messageReceiver, connection.userName, message, Id, isDeleted).catch(function (err) {
        return console.error(err.toString());
    });
  
});



Window.callLog = () => 
    connection.invoke("Log")
        .catch(function (err) {
            return console.error("LOG", err.toString());
        });

function RegisterUser() {
    var userName = document.getElementById("userName").value;
    connection.userName = userName;
    connection.invoke("UserRegister", userName).catch(function (error)
    {
        return console.error(error.toString());
    });
    event.preventDefault();
    console.log("Registered User"+currentUser);
};

function GetOnlineUsers() {
    connection.invoke("GetOnlineUsers", connection.connectionId).catch(function (error) {
        return console.error(error.toString());
    });
    connection.on("GetAllUsers", function (data) {
        var str = '<ul>'
        data.forEach(function (item) {
            str += '<li>' + item.userName + '</li>';
            console.log("All online Users:" + item.userName);

        });
        str += '</ul>';
        document.getElementById("onlineUsers").innerHTML = str;
        return console.log("LOG", data);
    });
}

function DeleteMessage(event) {
    //get id from selected message
    var retrievedObject = localStorage.getItem(event.id);

    var messageReceiver = document.getElementById("selectedUsername").value;
    var tempObject = JSON.parse(retrievedObject);
    delete tempObject.Content;
    event.innerHTML = "You deleted this message!!!";
  
    localStorage.setItem(event.id, retrievedObject);
    isDeleted = true;
    connection.invoke("SendMessage", messageReceiver, connection.userName, "", event.id, isDeleted).catch(function (err) {
        return console.error(err.toString());
    });
   
}

function appendMessage(name, img, side, text,id) {
    //   Append the message for chat
    const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <a class="msger-close-btn" onclick='DeleteMessage(${id})' href="#"></a>
        <div class="msg-info">
            <div class="msg-info-row">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
            </div>
            <div class="msg-text" id=${id}>${text}</div>
        </div>
      </div>
    </div>`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
}


// Utils
function get(selector, root = document) {
    return root.querySelector(selector);
}

function formatDate(date) {
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}



