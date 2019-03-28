console.log("\n*** MAIN.JS ***")
var id = null;
const graphics = new PIXI.Graphics();

var command = {};

const Game = {
    world: {},
    actorData: {},
    player: {}
}

const app = new PIXI.Application({
    width: 1024, 
    height: 512,                       
    antialias: false, 
    transparent: false,
    resolution: 1,
    //view: document.getElementById("game");
})

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x221122;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.margin = "auto";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', ()=> {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

function start() {
    console.log("\n*** Startup! ***");
    app.stage.addChild(graphics);

    window.addEventListener("resize", (event) => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
}

const drawMap = () => {
    graphics.clear();
    for(let key in Game.world){
        let [x,y] = key.split(',');
        let color = 0x778877;
        
        if(Game.world[key].actor){
            color = (Game.world[key].actor.id === id) ? 0xff00ff : 0x00ffff;
        }

        graphics.beginFill(color);
        graphics.drawRect(parseInt(x)*7, parseInt(y)*7, 6, 6);
    }
}

const socket = io();

socket.on('connect', () => {
    console.log("\n*** CONNECTED TO SOCKET *** ", socket.id);
    id = socket.id;

    document.addEventListener('keydown', (event)=>{
        command[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete command[event.key];
    });

    start();
});

socket.on('mapData', (mapData, actorData) => {
    Game.world = mapData;
    Game.actorData = actorData;
    drawMap();
})

setInterval(()=>{ // maybe only emit when command changes, 
    if(Object.keys(command).length > 0) {
        socket.emit('command', command);
    }
}, 1000 / 4);
    