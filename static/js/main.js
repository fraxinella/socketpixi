console.log("\n*** MAIN.JS ***")
var id = null;
var destination = null;
const graphics = new PIXI.Graphics();
const sprites = {};
var positions = {};
var world = {};
const zoom = 4;

const app = new PIXI.Application({
    width: 1024, 
    height: 512,                       
    antialias: false, 
    transparent: false,
    resolution: 1,
    //view: document.getElementById("game");
})

document.body.appendChild(app.view);

app.renderer.backgroundColor = 0xe0afb8;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.margin = "auto";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', ()=> {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

console.log("\n*** LOADING GRAPHICS ***");
PIXI.loader
.add("/img/persephone.png")
.add("/img/cursor.png")
.add("/img/coin.png")
.load(start);

function start() {
    console.log("\n*** Startup! ***")
    console.log("All Positions", positions);
    
    app.stage.addChild(graphics);

    // app.stage.addChild(new PIXI.Text('DojoNorth: 152.117.208.10:7777', {fontSize: "8em", fill: "#BE6B7A"}));
    if(!destination) {
        destination = new PIXI.Sprite(PIXI.loader.resources["/img/cursor.png"].texture);
        destination.scale.set(2,2);
        app.stage.addChild(destination);
    }
    
    
    for(let _id in positions){
        if(!sprites[_id]){
            console.log('adding sprite', _id);
            sprites[_id] = new PIXI.Sprite(PIXI.loader.resources["/img/persephone.png"].texture);    
            app.stage.addChild(sprites[_id]);
            sprites[_id].scale.set(zoom, zoom);
            sprites[_id].position.set(positions.x, positions.y)
            app.stage.addChild(sprites[_id]);
        }
    }
    
    positions[id] = {x: destination.x, y: destination.y };

    console.log("DA SPRITES", {...sprites});
    console.log("\n*** Start Game Loop: ***");
    
    // window.addEventListener("resize", (event) => {
    //     app.renderer.resize(window.innerWidth, window.innerHeight);
    // });

    socket.emit('playerInput', {id: id, x: destination.x, y: destination.y})
    gameLoop();
}

const gameLoop = () => {
    for(let _id in sprites){
        if(positions[_id]) sprites[_id]['x'] += (positions[_id]['x'] - sprites[_id]['x']) * .1;
        if(positions[_id]) sprites[_id]['y'] += (positions[_id]['y'] - sprites[_id]['y']) * .1;
    }
    requestAnimationFrame(gameLoop);
}

const drawMap = () => {
    graphics.clear();
    for(let key in world){
        parts = key.split(',');
        graphics.beginFill(0x887788);
        graphics.drawRect(parseInt(parts[0])*48, parseInt(parts[1])*48, 48, 48);
    }
}

const socket = io();

socket.on('connect', () => {
    console.log("\n*** CONNECTED TO SOCKET *** ", socket.id);
    id = socket.id,
    console.log(id);

    document.addEventListener('mousemove', ()=>{
        if(destination){
            destination.x = app.renderer.plugins.interaction.mouse.global.x;
            destination.y = app.renderer.plugins.interaction.mouse.global.y;
        }
        // console.log('mouse moving!', positions[id]);
    })
});

socket.on('initMap', (mapData) => {
    console.log("Got Map Data!", {...mapData});
    world = {...mapData};
    drawMap();
})

socket.on('initPositions', (data) => {
    console.log('\n*** Initializing Positions ***');
    positions = data;
    console.log(positions);
    start();
})

socket.on('updatePositions', (newPositions)=> {
    // console.log("updating positions", newPositions);
    positions = newPositions;
    // console.log('\n** POS UPDATE **', newPositions);
    for(let _id in positions) {
        //create a sprite if new entity
        // if(!sprites[_id]){
        //     // console.log('adding sprite', _id);
        //     sprites[_id] = new PIXI.Sprite(PIXI.loader.resources["/img/persephone.png"].texture);    
        //     app.stage.addChild(sprites[_id]);
        //     sprites[_id].scale.set(8,8);
        //     sprites[_id].position.set(positions.x, positions.y)
        //     // console.log("new sprites position", sprites[_id].position);
        // }
        // console.log('ID: ', _id, ' Sprites: ', sprites);
    }
    // console.log("All Positions: ",positions)
    if(destination) socket.emit('playerInput', {id: id, x: destination.x, y: destination.y})
})

socket.on('playerConnect', (playerId) => {
    console.log('Player Connected: ', playerId);
    console.log('adding sprite', playerId);
            sprites[playerId] = new PIXI.Sprite(PIXI.loader.resources["/img/persephone.png"].texture);    
            app.stage.addChild(sprites[playerId]);
            sprites[playerId].scale.set(zoom, zoom);
            sprites[playerId].position.set(positions.x, positions.y)
            // console.log("new sprites position", sprites[playerId].position);
            app.stage.addChild(sprites[playerId]);
})

socket.on('playerDisconnect', (playerId) => {
    console.log('Player Disconected: ', playerId);
    app.stage.removeChild(sprites[playerId]);
    delete sprites[playerId];
    delete positions[playerId];
})


    