const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
let messageInput = document.getElementById('message-input');

const name = prompt('What is your name?');
appendMessage('You joined the chat');
socket.emit('new-user', name);

socket.on('user-connected', name => {
    appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
});

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);                         // receiving text from others
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);                                       // showing the text you sent
    socket.emit('send-chat-message', message);                              // sending text to server
    messageInput.value = '';                                                // emptying message box after sent
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}