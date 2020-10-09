"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
let selecteduserName;

const deletedMessage = "this message was deleted";

let currentConnectedUser;

const messageFrom = get(".msger-inputarea");
const messageInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const BOT_IMG = "https://image.flaticon.com/icons/svg/145/145866.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";

const modalCloseBtn = document.getElementsByClassName("close")[0];
const modalSaveBtn = document.getElementsByClassName("userSave")[0];
const myModal = document.getElementById("myModal");

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
}

modalSaveBtn.onclick = function () {
    currentConnectedUser = document.getElementById("userDisplayName").value.trim();
    document.getElementById("currentUser").innerText = currentConnectedUser
    RegisterUser();
    toggleVisibility(myModal, false);
}

connection.on("ReceiveMessage", function (messageId, timestamp, message, messageSender) {

    AddNewMessage(messageId, timestamp, message, "left", messageSender);

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

    AddNewMessage(messageId, timestamp, message, "right", messageReceiver);

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
};

connection.on("GetAllUsers", function (data) {
    var element = '<ul class="userlist">';
    data
        .filter(item => item != currentConnectedUser)
        .forEach(function (item) {
            const classes = selecteduserName == item ? "highlight" : undefined;
            element += CreateListUsers(item, classes);

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

function CreateListUsers(item, classes = "") {
    return '<li id="' + item + '_item" class="item ' + classes + '" onclick="SelectedUser(this)"><img src="https://image.flaticon.com/icons/svg/145/145866.svg" alt="Avatar" class="avatar"/>' + item + '<span id="' + item + '_dot" class="dot" style="display:none; float:right; margin-top:10px;">0</span></li>';
}

function SelectedUser(element) {

    msgerChat.innerHTML = "";
    const newSelectedUser = element.childNodes[1].textContent.trim();

    if (selecteduserName == newSelectedUser) {
        return;
    }

    if (selecteduserName != undefined) {
        const highlightedElement = document.getElementById(selecteduserName + "_item");
        highlightedElement.classList.remove("highlight");
    }

    selecteduserName = newSelectedUser;
    element.classList.add("highlight");

    document.getElementById('chatuser').innerText = selecteduserName;
    clearBadge(selecteduserName);

    LoadHistoryMessages();
}

messageFrom.addEventListener("submit", event => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) return;

    connection.invoke("SendMessage", selecteduserName, currentConnectedUser, message).catch(function (err) {
        return console.error(err.toString());
    });

    messageInput.value = "";

});


function DeleteMessage(id) {

    const messageObject = getMessagesObject(selecteduserName);

    messageObject[id].Content = deletedMessage;

    saveMessagesObject(selecteduserName, messageObject);

    const deletedItem = document.getElementById(id);
    deletedItem.innerText = deletedMessage;


    connection.invoke("RemoveMessage", selecteduserName, currentConnectedUser, id).catch(function (err) {
        return console.error(err.toString());
    });

}

connection.on("DeleteMessage", function (messageId, messageSender) {

    const messageObject = getMessagesObject(messageSender);

    if (messageId in messageObject) {

        messageObject[messageId].Content = deletedMessage;
        saveMessagesObject(messageSender, messageObject);

        if (selecteduserName != undefined && messageSender == selecteduserName) {
            const deletedItem = document.getElementById(messageId);
            deletedItem.innerText = deletedMessage;
        }
    }

});




function appendMessage(name, img, side, text, id) {
    //   Append the message for chat
    const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url('${img}')"></div>

      <div class="msg-bubble">
        <a class="msger-close-btn" onclick='DeleteMessage("${id}")' href="#"></a>
        <div class="msg-info">
            <div class="msg-info-row">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
            </div>
            <div class="msg-text" id="${id}">${text}</div>
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

    const messageObject = getMessagesObject(messageReceiver);

    messageObject[messageId] = CreateMessage(messageId, timestamp, message, sideParam);

    saveMessagesObject(messageReceiver, messageObject);

    if (selecteduserName != undefined && messageReceiver == selecteduserName) {
        appendMessage(currentConnectedUser, PERSON_IMG, sideParam, message, messageId);
    } else {
        if (sideParam == "left") {
            addBadge(messageReceiver);
        }
    }

}

function LoadHistoryMessages() {

    const messageObject = getMessagesObject(selecteduserName);

    Object.values(messageObject).forEach(function ({
        MessageId: messageId,
        Content: message,
        Messageside: sideParam
    }) {
        const user = sideParam != "left" ? currentConnectedUser : selecteduserName;
        appendMessage(user, PERSON_IMG, sideParam, message, messageId);
    });

}

function getMessagesObject(remoteUser) {
    const storageKey = `${currentConnectedUser}_${remoteUser}`;
    const item = localStorage.getItem(storageKey);
    return item != null ? JSON.parse(item) : {};
}

function saveMessagesObject(remoteUser, messageObject) {
    const storageKey = `${currentConnectedUser}_${remoteUser}`;
    localStorage.setItem(storageKey, JSON.stringify(messageObject));
}


function addBadge(item) {
    const badgeItem = document.getElementById(item + "_dot");
    let count = parseInt(badgeItem.innerText);
    badgeItem.innerText = count + 1;
    badgeItem.style.display = "block";
}

function clearBadge(item) {
    const badgeItem = document.getElementById(item + "_dot");
    badgeItem.innerText = 0;
    badgeItem.style.display = "none";
}

