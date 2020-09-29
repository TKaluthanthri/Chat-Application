"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
let selecteduserName;
let selectedlistItem;

const deletedMessage = "this message was deleted";

let currentConnectedUser;

const messageFrom = get(".msger-inputarea");
const messageInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const BOT_IMG = "https://image.flaticon.com/icons/svg/145/145866.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";

const modalCloseBtn = document.getElementsByClassName("close")[0];
const modalSaveBtn = document.getElementsByClassName("userSave")[0];
let myModal = document.getElementById("myModal");

function toggleVisibility(element, IsShow) {
    if (IsShow) {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    toggleVisibility(myModal, true);
});


modalCloseBtn.onclick = function () {
   
    toggleVisibility(myModal, false);
    GetOnlineUsers();
}

modalSaveBtn.onclick = function () {
    currentConnectedUser = document.getElementById("userDisplayName").value.trim();
    RegisterUser();
    toggleVisibility(myModal, false);
}

//var $selectedUser = $('.item').click(function (e) {
//    e.preventDefault();
//   // $thumbs.removeClass(classHighlight);
//    $(this).addClass("highlight");
//});
//Disable send button until connection is established
//document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (messageId, timestamp, message, messageSender) {

    AddNewMessage(messageId, timestamp, message, "right", messageSender);

});

function CreateMessage(messageId, timestamp, message, side) {

    const createdDate = new Date(timestamp).toString()
    const index = createdDate.lastIndexOf(':') + 3
    const messageSentTime = createdDate.substring(0, index);

    return {
        MessageId: messageId,
        Content: message,
        DeliveredTime: messageSentTime,
        Messageside: side,
    };
}


connection.on("MessageSent", function (messageId, timestamp, message, messageReceiver) {

    AddNewMessage(messageId, timestamp, message, "left", messageReceiver);

    // console.log('storedObject: ', JSON.parse(messageObject));
});

//SignalR connection start and register user

connection.start().then(function () {
    console.log("SignalR Connection Established...");
}).catch(function (err) {
    return console.error(err.toString());
});


function RegisterUser() {

    connection.invoke("UserRegister", currentConnectedUser).catch(function (error) {
        return console.error(error.toString());
    });
    event.preventDefault();
    console.log("Registered User : " + currentConnectedUser);

    GetOnlineUsers();
};

connection.on("GetAllUsers", function (data) {
    var element = '<ul class="userlist">';
    data
        .filter(item => item != currentConnectedUser)
        .forEach(function (item) {

        element += CreateListUsers(item);

    });
    element += '</ul>';

    const userListDiv = get('.onlineUsers');
    const oldList = get(".userlist", userListDiv);

    if (oldList != null) {
        oldList.parentNode.removeChild(oldList);
    }

    //document.getElementsByClassName("onlineUsers").innerHTML = element;


    userListDiv.insertAdjacentHTML("beforeend", element);
    userListDiv.scrollTop += 500;
});

function GetOnlineUsers() {
    
}

function CreateListUsers(item) {
    return '<li class="item" onclick="SelectedUser(this)"><img src="https://image.flaticon.com/icons/svg/145/145866.svg" alt="Avatar" class="avatar"> ' + item + '</li>';
}

function SelectedUser(element) {
    console.log(element.textContent.trim());

    selecteduserName = element.textContent.trim();
    
    
    if ((selectedlistItem != undefined) && (selectedlistItem.classList.contains("highlight"))) {
      selectedlistItem.classList.remove("highlight");
    }
    selectedlistItem = element;
    selectedlistItem.classList.add("highlight");
    document.getElementsByClassName('chatuser')[0].innerText = selecteduserName;

    LoadHistoryMessages();
    
}

messageFrom.addEventListener("submit", event => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) return;

    connection.invoke("SendMessage", selecteduserName, currentConnectedUser, message).catch(function (err) {
        return console.error(err.toString());
    });
  
});


function DeleteMessage(event) {

    const storageKey = `${currentConnectedUser}_${selecteduserName}`;
    const item = localStorage.getItem(storageKey);
    let messageObject = item != null ? JSON.parse(item) : {};


    messageObject[event.id].Content = deletedMessage;

    localStorage.setItem(storageKey, JSON.stringify(messageObject));

    const deletedItem = document.getElementById(event.id);
    deletedItem.innerText = deletedMessage;
    

    connection.invoke("RemoveMessage", currentConnectedUser, event.id).catch(function (err) {
        return console.error(err.toString());
    });
   
}

connection.on("DeleteMessage", function (messageId, messageSender) {

    const storageKey = `${currentConnectedUser}_${messageSender}`;
    const item = localStorage.getItem(storageKey);
    let messageObject = item != null ? JSON.parse(item) : {};

    
    messageObject[messageId].Content = deletedMessage;
    localStorage.setItem(storageKey, JSON.stringify(messageObject));

    if (messageSender == selecteduserName) {

        const deletedItem = document.getElementById(messageId);
        deletedItem.innerText = deletedMessage;
    }

});




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

function AddNewMessage(messageId, timestamp, message, sideParam, messageReceiver) {
    const storageKey = `${currentConnectedUser}_${messageReceiver}`;
    const item = localStorage.getItem(storageKey);
    let messageObject = item != null ? JSON.parse(item) : {};

    messageObject[messageId] = CreateMessage(messageId, timestamp, message, sideParam);

    localStorage.setItem(storageKey, JSON.stringify(messageObject));

    if (selecteduserName != undefined && messageReceiver == selecteduserName) {
        appendMessage(currentConnectedUser, PERSON_IMG, sideParam, message, messageId);
    }

}

function LoadHistoryMessages() {

    const storageKey = `${currentConnectedUser}_${selecteduserName}`;
    const item = localStorage.getItem(storageKey);
    let messageObject = item != null ? JSON.parse(item) : {};

    Object.values(messageObject).forEach(function ({
        MessageId: messageId,
        Content: message,
        Messageside: sideParam
    }) {

        appendMessage(currentConnectedUser, PERSON_IMG, sideParam, message, messageId);

    });

  

}





