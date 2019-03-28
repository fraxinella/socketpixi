const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Game = {
    width: 128,
    height: 128,
    map: {},
    freeCells: {}, // Do I need to keep free cells around.. or just iterate to find the free cells.
    actors: {},
    props: {},
    items: {},
    commandList: {},
}

const doCommands = () => {
    for(let actorID in Game.commandList) { 
        let actor = Game.actors[actorID];

        for(let command in Game.commandList[actorID]){
            switch(command) {
                case 'w':
                    moveActor(actorID, actor.x.toString()+','+(actor.y-1).toString());
                    break;
                case 's':
                    moveActor(actorID, actor.x.toString()+','+(actor.y+1).toString());
                    break;
                case 'a':
                    moveActor(actorID, (actor.x-1).toString()+','+(actor.y).toString());
                    break;
                case 'd':
                    moveActor(actorID, (actor.x+1).toString()+','+(actor.y).toString());
                    break;
                default:
            }
        }
    }
}

const moveActor = (actorID, dest) => {
    if(Game.map[dest] && Game.map[dest].actor === null) {
        let [dx,dy] = dest.split(',');
        let actor = Game.actors[actorID];
        Game.map[actor.x+','+actor.y].actor = null;
        Game.freeCells[actor.x+','+actor.y] = 
        Game.map[dx+','+dy].actor = actor;
        actor.x = parseInt(dx);
        actor.y = parseInt(dy);

        delete Game.freeCells[dest];
    } else {

    }
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
            Game.freeCells[key] = true;
            count++;
        }
    }

    // console.log("Map Created: ", Game.map);
}

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

io.on('connection', (socket) => {
    console.log('User: ', socket.id, ' connected.');
    let keys = Object.keys(Game.freeCells);
    key = keys[Math.floor(Math.random() * keys.length)];
    let [x,y] = key.split(',');
    let actor = Game.actors[socket.id] = {
        id: socket.id,
        x: x,
        y: y,
        name: "stinky",
    }
    Game.map[key].actor = actor;
    socket.emit('mapData', Game.map, Game.actors)
    
    socket.broadcast.emit('playerConnect', socket.id, Game.map, Game.actors);
    
    socket.on('playerInput', (data) => {
        //If there's data, set a command for this id in Game.commandList
        // if not delete
    })
    
    socket.on('disconnect', () => {
        console.log('User: ', socket.id, ' disconnected.');

        let {x,y} = Game.actors[socket.id];
        Game.map[x+','+y].actor = null;
        Game.freeCells[x+','+y] = true;
        delete Game.actors[socket.id];
    });

    socket.on('command', (command) => {
        Game.commandList = { ...Game.commandList, [socket.id]:command }
    })
});



setInterval(() => {
    // Process commands
    doCommands();
    Game.commandList = {};
    // Process game changes

    // Emit new data
    io.emit('mapData', Game.map, Game.actors);
}, 1000 / 4)

http.listen(7777, () => {
    console.log('Listening on 7777');
})

initGame();
