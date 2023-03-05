<script>
	// Initialize the variable to be used for the WebSocket. It gets declared here because it
	// needs to be global rather than local to allow any existing connection to be closed if
	// the user logs in again.
	import { io } from 'socket.io-client';

	let socket;

	// Reference elements of `index.html` that need to be accessed throughout this file.
	var messageDiv;
	var errorMessageSpan = '';
	let userName;
	let password;
	let messageContent;

	// Take the entered username and password and attempt to authenticate them. If the
	// response indicates an error, provide the error message.
	const getJwtAuth = () => {
		fetch('http://localhost:3000/auth?username=' + userName.value + '&password=' + password.value)
			.then((response) => response.text())
			.then((response) => {
				if (response.includes('Error')) {
					errorMessageSpan = response;
				} else {
					errorMessageSpan = '';
					openWsConnection(response);
				}
			})
			.catch((err) => console.log(err));
	};

	// Send the message entered by the user. First, however, ensure that the user is logged
	// in and that the message field is not empty.
	const sendWsMessage = () => {
		if (socket) {
			if (messageContent.value != '') {
				socket.emit('message', messageContent.value);
			} else {
				errorMessageSpan = 'Error: Message content cannot be empty.';
			}
		} else {
			errorMessageSpan = 'Error: You must log in to send a message.';
		}
	};

	// Open the WebSocket connection using the JWT.
	const openWsConnection = (jwtAuth) => {
		if (socket) {
			socket.close();
		}

		socket = io('http://localhost:3000/?token=' + jwtAuth, {
			reconnectionDelayMax: 10000,
			cors: { origin: 'http://localhost:3000' }
		});

		socket.onopen = (event) => {
			console.log('WebSocket connection established.');
			socket.send('Hello, world!');
		};

		socket.on('message', (data) => {
			console.log('WebSocket message received: ', data);

			if (data.includes('Error')) {
				errorMessageSpan = data;
			} else {
				let newMessageDiv = document.createElement('div');
				newMessageDiv.textContent = data;

				messageDiv.appendChild(newMessageDiv);
			}
		});

		socket.onerror = (event) => {
			console.log('WebSocket error received: ', event);
		};

		socket.onclose = (event) => {
			console.log('WebSocket connection closed.');
		};
	};
</script>

<title>Example App Using WebSockets and JWTs</title>

<body>
	<h1>Example App Using WebSockets and JWTs</h1>
	<div class="row">
		<div class="column" id="loginForm">
			<span id="errorMessage">{errorMessageSpan}</span>
			<form>
				<label for="username">Username: </label>
				<input bind:this={userName} type="text" id="username" /><br />
				<label for="password">Password: </label>
				<input bind:this={password} type="text" id="password" /><br />
				<input type="button" id="login" value="Login" on:click={getJwtAuth} />
			</form>
			<form>
				<label for="messageContent">Message: </label>
				<textarea bind:this={messageContent} id="messageContent" />
				<input type="button" id="send" value="Send" on:click={sendWsMessage} />
			</form>
		</div>
		<div bind:this={messageDiv} class="column" id="messages" />
	</div>
</body>

<style>
	h1 {
		text-align: center;
	}

	.row {
		display: flex;
	}

	.column {
		flex: 50%;
	}

	#loginForm {
		text-align: center;
	}

	#errorMessage {
		color: red;
	}
</style>
