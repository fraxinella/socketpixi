const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const zoom = 8;

const Game = {
    width: 128,
    height: 128,
    map: {},
    actors: {},
    props: {},
    items: {},
    commandList: {},
}

stage = {
    width: 1024,
    height: 512
}

const allUsers = {};
const inputPack = {};
const ball = {
    x: 512,
    y: 256,
    width: 8,
    height: 8
}

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

io.on('connection', (socket) => {
    console.log('User: ', socket.id, ' connected.');
    socket.broadcast.emit('playerConnect', socket.id);
    allUsers[socket.id] = {
        x: 0,
        y: 0
    }
    
    inputPack[socket.id] = {
        x:0,
        y:0
    }
    
    socket.emit('initPositions', allUsers);

    socket.on('playerInput', (data) => {
        inputPack[data.id] = {x: data.x, y: data.y};
    })
    
    socket.on('disconnect', () => {
        console.log('User: ', socket.id, ' disconnected.');
        // console.log("all users: ", allUsers);
        socket.broadcast.emit('playerDisconnect', socket.id);
        delete allUsers[socket.id];
        delete inputPack[socket.id];
    });
});

setInterval(() => {
    for(let id in allUsers){
        // console.log("INPUT:",inputPack[id]);
        allUsers[id].x += (inputPack[id].x - allUsers[id].x) * .25;
        allUsers[id].y += (inputPack[id].y - allUsers[id].y) * .25;
    }
    io.emit('updatePositions', allUsers);
}, 1000 / 10)

http.listen(7777, () => {
    console.log('Listening on 7777');
})
