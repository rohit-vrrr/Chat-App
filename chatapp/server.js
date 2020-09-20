const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

app.set('views', './views');                                            // html/ejs directory
app.set('view engine', 'ejs');                                          // ejs platform
app.use(express.static('public'));                                      // client js code directory
app.use(express.urlencoded({ extended: true }));                        // to use urlencoded parameters

const rooms = {};

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms });
})

app.post('/room', (req, res) => {
    if(rooms[req.body.room] != null) {                                  // if the room already exists
        return res.redirect('/');
    }
    rooms[req.body.room] = { users: {} };
    res.redirect(req.body.room);
    // Send message that new room was created
    io.emit('room-created', req.body.room);
});

app.get('/:room', (req, res) => {                                       // parameter in url, for room
    if(rooms[req.params.room] == null) {
        return res.redirect('/');
    }
    res.render('room', { roomName: req.params.room });
});

server.listen(3000);                                                    // listening on port 3000

/**
 * In room operations
 */

io.on('connection', socket => {

    socket.on('new-user', (room, name) => {
        socket.join(room);
        rooms[room].users[socket.id] = name;                            // assign name to socket id
        socket.to(room).broadcast.emit('user-connected', name);         // broadcasting text to all except self
        // console.log(name+' joined');
    })

    socket.on('send-chat-message', (room, message) => {
        // console.log(message);
        socket.to(room).broadcast.emit('chat-message', { message: message,
            name: rooms[room].users[socket.id] });
    });

    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id]);
            delete rooms[room].users[socket.id];
        });
    })
});


function getUserRooms(socket) {
    /**
     * Converts object to an array which we can use inside of our method
     */
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if(room.users[socket.id] != null) names.push(name);
        return names;
    }, [])
}