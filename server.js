const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const rooms = {};

app.route('/')
    .get((req, res) => {
        res.render('index', { rooms: rooms });
    });

app.route('/room')
    .post((req, res) => {
        // if the room already exists
        if(rooms[req.body.room] != null) {
            return res.redirect('/');
        }
        rooms[req.body.room] = { users: {} };
        res.redirect(req.body.room);
        // Send message that new room was created
        io.emit('room-created', req.body.room);
    });

app.route('/:room')
    .get((req, res) => {
        // parameter in url, for room
        if(rooms[req.params.room] == null) {
            return res.redirect('/');
        }
        res.render('room', { roomName: req.params.room });
    });

server.listen(3000, () => {
    console.log("Server running on port 3000");
});

///////////////////////// In room operations /////////////////////////

io.on('connection', socket => {

    socket.on('new-user', (room, name) => {
        socket.join(room);
        // assign name to socket id
        rooms[room].users[socket.id] = name;
        // broadcasting text to all except self
        socket.to(room).broadcast.emit('user-connected', name);
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
