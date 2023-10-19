const socketIO = require('socket.io') // Attach Socket.io to the HTTP server
const dotenv = require('dotenv')
dotenv.config()
const controller = require('../controller/chatController.js')

function intializeSocket(server) {
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors: {
            origin: ['https://nowandme.netlify.app', 'http://localhost:4200']
        },
    });

    // Socket.io connection
    io.on('connection', (socket) => {
        socket.on('setup', (id) => {
            socket.join(id)
            socket.emit('connected')
            console.log('A user connected');
        });

        socket.on('join', (room) => {
            socket.join(room);
        })

        socket.on('chatMessage', (message) => {
            console.log(message.receiver);
            io.emit(message.receiver, message);
            console.log(message, "message from socket");
            controller.sendMessage(message)

        });
        socket.on('abc', (a) => {
            console.log(a);
        })

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

}

module.exports = intializeSocket