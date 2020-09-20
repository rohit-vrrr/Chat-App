const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById('send-container');
let messageInput = document.getElementById('message-input');

if(messageForm != null) {
    const name = prompt('What is your name?');
    appendMessage('You joined the chat');
    socket.emit('new-user', roomName, name);

    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = messageInput.value;
        appendMessage(`You: ${message}`);                                       // showing the text you sent
        socket.emit('send-chat-message', roomName, message);                    // sending roomName and text to server
        messageInput.value = '';                                                // emptying message box after sent
    });
}

socket.on('room-created', room => {
    /* <div><%= room %></div>
        <a href="/<%= room %>">Join</a>
     */
    const roomElement = document.createElement('div');
    roomElement.innerText = room;
    const roomLink = document.createElement('a');
    roomLink.href = `/${room}`;
    roomLink.innerText = 'join';

    roomContainer.append(roomElement);
    roomContainer.append(roomLink);
})

socket.on('user-connected', name => {
    appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
});

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`);                         // receiving text from others
});


function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}
