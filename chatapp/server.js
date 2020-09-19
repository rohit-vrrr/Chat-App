const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

app.set('views', './views');                                            // html/ejs directory
app.set('view engine', 'ejs');                                          // ejs platform
app.use(express.static('public'));                                      // client js code directory
app.use(express.urlencoded({ extended: true }));                        // to use urlencoded parameters

const rooms = { name: {} };
app.get('/', (req, res) => {
    res.render('index', { rooms: rooms });
})

app.get('/:room', (req, res) => {                                       // parameter in url, for room
    res.render('room', { roomName: req.params.room });
});

server.listen(3000);                                                    // listening on port 3000

/**
 * In room operations
 */

const users = {};

io.on('connection', socket => {

    socket.on('new-user', name => {
        users[socket.id] = name;                                        // assign name to socket id
        socket.broadcast.emit('user-connected', name);                  // broadcasting text to all except self
        // console.log(name+' joined');
    })

    socket.on('send-chat-message', message => {
        // console.log(message);
        socket.broadcast.emit('chat-message', { message: message,
            name: users[socket.id] });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    })
});
