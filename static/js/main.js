console.log("\n*** MAIN.JS ***")
var id = null;
const graphics = new PIXI.Graphics();

var command = {};
var changed = false;
const Game = {
    world: {},
    actorData: {},
    player: {}
}
var timer = 0;
var tick = 1000 / 10; //  10hz

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
        changed = true;
        command[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        changed = true;
        delete command[event.key];
    });

    console.log("\n*** Startup! ***");
    app.stage.addChild(graphics);

    window.addEventListener("resize", (event) => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
});

socket.on('mapData', (mapData, actorData) => {
    Game.world = mapData;
    Game.actorData = actorData;
    drawMap();
})

setInterval(()=>{ 
    timer += tick;
    if(changed || timer >= 500) {
        socket.emit('command', command);
        changed = false;
        timer %= 500;
    }
}, 1000/60);
    