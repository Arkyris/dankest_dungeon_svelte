// Initialize the variable to be used for the WebSocket. It gets declared here because it
// needs to be global rather than local to allow any existing connection to be closed if
// the user logs in again.
import { io } from 'socket.io-client';

let socket;

// Reference elements of `index.html` that need to be accessed throughout this file.
var messageDiv = document.querySelector("#messages");
var errorMessageSpan = document.querySelector("#errorMessage");

// Take the entered username and password and attempt to authenticate them. If the
// response indicates an error, provide the error message.
export const getJwtAuth = () => {
    var username = document.querySelector("#username").value;
    var password = document.querySelector("#password").value;

    fetch("http://localhost:3000/auth?username=" + username + "&password=" + password)
        .then(response => response.text())
        .then((response) => {
            if (response.includes("Error")) {
                errorMessageSpan.innerHTML = response;
            } else {
                errorMessageSpan.innerHTML = "";
                openWsConnection(response);
            }
        })
        .catch(err => console.log(err));
}

// Send the message entered by the user. First, however, ensure that the user is logged
// in and that the message field is not empty.
const sendWsMessage = () => {
    var messageContent = document.querySelector("#messageContent").value;

    if (socket) {
        if (messageContent != "") {
            socket.send(messageContent);
        } else {
            errorMessageSpan.innerHTML = "Error: Message content cannot be empty."
        }
    } else {
        errorMessageSpan.innerHTML = "Error: You must log in to send a message."
    }
}

// Open the WebSocket connection using the JWT.
const openWsConnection = (jwtAuth) => {
    if (socket) {
        socket.close();
    }

    
    socket = io('http://localhost:3000/ws?token=' + jwtAuth, {
        reconnectionDelayMax: 10000,
        cors: { origin: 'http://localhost:3000' }
    })

    socket.onopen = (event) => {
        console.log("WebSocket connection established.");
        socket.send("Hello, world!");
    }

    socket.onmessage = (event) => {
        console.log("WebSocket message received: ", event.data);

        if (event.data.includes("Error")) {
            errorMessageSpan.innerHTML = event.data;
        } else {
            let newMessageDiv = document.createElement("div");
            newMessageDiv.textContent = event.data;

            messageDiv.appendChild(newMessageDiv);
        }
    }

    socket.onerror = (event) => {
        console.log("WebSocket error received: ", event);
    }

    socket.onclose = (event) => {
        console.log("WebSocket connection closed.");
    }
}