const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Game = {
    width: 128,
    height: 128,
    map: {},
    freeCells: [],
    actors: {},
    props: {},
    items: {},
    commandList: {},
}

initGame = () => {
    console.log("Initializing Game!");
    let count = 0;
    Game.map = {};

    while(count < 128*128*.75) {
        let xr = Math.floor(Math.random() * Game.width);
        let yr = Math.floor(Math.random() * Game.height);
        let key = xr+","+yr;

        if(!Game.map[key]) {
            Game.map[key] = {
                type: "grass",
                actor: null,
                items: [],
            }
            Game.freeCells.push(key);
            count++;
        }
    }

    // console.log("Map Created: ", Game.map);
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
    
    let key = Game.freeCells.splice(Math.floor(Math.random * Game.freeCells.length), 1)[0];
    let [x,y] = key.split(',');
    let actor = Game.actors[socket.id] = {
        x: x,
        y: y,
        name: "stinky",
    }
    Game.map[key].actor = actor;
    socket.emit('mapData', Game.map, Game.actors)
    // socket.on('playerInput', (data) => {
    //     inputPack[data.id] = {x: data.x, y: data.y};
    // })
    
    socket.on('disconnect', () => {
        console.log('User: ', socket.id, ' disconnected.');
        socket.broadcast.emit('playerDisconnect', socket.id);
        // console.log("all users: ", allUsers);
        let {x,y} = Game.actors[socket.id];
        Game.map[x+','+y].actor = null;
        Game.freeCells.push(x+','+y);
        delete Game.actors[socket.id];
    });
});

setInterval(() => {
    
    io.emit('updatePositions', allUsers);
}, 1000 / 10)

http.listen(7777, () => {
    console.log('Listening on 7777');
})

initGame();
