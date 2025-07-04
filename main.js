"use strict"
// room ideas
/**
 * Spider lair
 * Library
 * grand staircase
 * fountain
 * gargoyle
 * sphinx
 * large pond
 * lava
 * waterfall
 * library with desk
 * 
 * warehouse / tile floor
 * 
 * wood floor
 * marble /lighter cobblestone
 * carpet
 * 
 * l
 * 
 * https://kenmi-art.itch.io/cute-fantasy-rpg
 * 
 */

import * as lib from "./lib.js";
import {generateDungeon} from "./terrainGenerator.js"
import * as engine from "./engine.js";
import TorchEntity from "./TorchEntity.js"


let maze = [];
let at = [];

let TILE_SIZE = 64;


let SEED = 45;
let NODE_COUNT = 20;
var allTerrain, startStopPoints = {};
var xOffset = 0;
var yOffset = 0;




engine.addImage("GRASS","grass.png");
engine.addImage("SAND","sand.png");
engine.addImage("STONE_BRICK","stoneBrick.png");

engine.addImage("GOLD","goldCoins.png");
engine.addImage("POND","pond.png");

engine.addImage("ARROW_L","arrow_l.png");
engine.addImage("ARROW_R","arrow_r.png");
engine.addImage("ARROW_U","arrow_u.png");
engine.addImage("ARROW_D","arrow_d.png");
engine.addImage("ARROW_LH","arrow_lh.png");
engine.addImage("ARROW_RH","arrow_rh.png");
engine.addImage("ARROW_UH","arrow_uh.png");
engine.addImage("ARROW_DH","arrow_dh.png");

engine.addImage("TAG","tag.png");

engine.addImage("CHAR_U","char/waddleU.png")
engine.addImage("CHAR_D","char/waddleD.png")
engine.addImage("CHAR_L","char/waddleL.png")
engine.addImage("CHAR_R","char/waddleR.png")

engine.addImage("TORCH","torch_01.png")
engine.addPassiveAnimation("TORCHL", ["torch_02.png","torch_03.png","torch_04.png","torch_05.png"])


let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');

let KeyPresses = {};

let charBuffer = [];
let lastClick = {};

document.getElementsByTagName('canvas')[0].onmousedown = function(e)
{
	lastClick = e;
}

window.onkeydown = function(e)
{
	KeyPresses[e.key] = true;
	if(e.key.length == 1)
		charBuffer += e.key;
	if(e.key == "Backspace")
		charBuffer += "\b";
}
window.onkeyup = function(e)
{
	KeyPresses[e.key] = false;
}

let mouse = {x: 0, y: 0};

document.getElementsByTagName('canvas')[0].onmousemove = function(e)
{
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;
}

let x = 2;
let y = 2;
/** 
 * Terriain is a list of the terrain currently loaded which should be updated and drawn
 * It does not contain a list of all the terrain which forms the dungeon
 */
let terrain = [];

let introScreen = {};

let inIntroScreen = true;


function gameLoop()
{
	try
	{
		if(inIntroScreen)
		{
			menuScreenUpdate();
			menuScreenDraw();
		}
		else
		{
			inMazeUpdate();
			inMazeDraw();
		}
		
		requestAnimationFrame(gameLoop);
	}
	catch(e)
	{
		throw e;
	}

	
}

let counter2 = 1;

let labelTarget = null;


function localizedBounds(terrain)
{
	if(terrain.localCoordinates)
		return terrain.bounds.map(x => lib.addV2(x, terrain.localCoordinates))
	return terrain.bounds;
}

function inMazeUpdate()
{
	let points = [[x+.4, y+.4], [x-.4, y+.4],[x+.4, y-.4], [x-.4, y-.4]];
	let mainRoom = terrain.filter(x => x.isRoom)[0] || {}

	for(let area of terrain)
	{
		if(area.type && area.type.endsWith("transition") && area.connectsTo != undefined)
		{
			if(points.map(p => lib.isPointInShape(p, localizedBounds(area))).reduce((a,b) => a && b, true))
			{
				labelTarget = null
				transitionDungeons(area);
			}
		}
	}

	if(mainRoom && mainRoom.entities)
	{
		let charPos = lib.addV2([x,y], lib.scaleV2(mainRoom.localCoordinates, -1));
		for(let entity of mainRoom.entities)
		{

			entity.update({
				charPos,
			});
		}
	}

	if(transitionPercent >= 0)
	{
		transitionPercent += .05;
		if(transitionPercent >= 1)
			transitionPercent = 1;

		for(let area of terrain)
		{
			if(area.transition == "out")
			{
				area.fade = transitionPercent;
			}
			if(area.transition == "in")
			{
				area.fade = 1 - transitionPercent;
			}
			if(area.transition == "left")
			{
				area.left = transitionPercent;
				area.right = 1- transitionPercent;
			}
			if(area.transition == "right")
			{
				area.left = 1- transitionPercent;
				area.right = transitionPercent;
			}
		}
	}

	if(transitionPercent == 1)
	{
		transitionPercent = -1;
		for(let i=0; i < terrain.length; i++)
		{
			if(terrain[i].transition == "out")
			{
				terrain.splice(i, 1);
				i--;
			}
			else
			{
				delete terrain[i].transition;
			}
		}
	}

	let delta = -0.0001 + Math.random() * .0002
	
	let charSize = .4;
	if(KeyPresses["ArrowUp"] && isPointInTerrain([x+charSize, y - .08 - charSize + delta]) && isPointInTerrain([x-charSize, y - .08 - charSize + delta]))
	{
		y -= .08;
		charDir = "U"
	}
	if(KeyPresses["ArrowDown"] && isPointInTerrain([x+charSize, y + .08 + charSize + delta]) && isPointInTerrain([x-charSize, y + .08 + charSize + delta]))
	{
		y += .08;
		charDir = "D"
	}

	if(KeyPresses["ArrowLeft"] && isPointInTerrain([x - .08 - charSize + delta, y+charSize]) && isPointInTerrain([x - .08 - charSize + delta, y-charSize]))
	{
		x -= .08;
		charDir = "L"
	}
	if(KeyPresses["ArrowRight"] && isPointInTerrain([x + .08 + charSize + delta, y+charSize]) && isPointInTerrain([x + .08 + charSize + delta, y-charSize]))
	{
		x += .08;
		charDir = "R"
	}

	// should be refactored into arrow entities
	if(mainRoom.isRoom)
	{
		if(lastClick.x != undefined)
		{
			labelTarget= null;
			for(let i=0; i< mainRoom.exits.length; i++)
			{
				let [x,y,_] = getExitArrowCoords(mainRoom.exits[i]);
				x = x*TILE_SIZE - xOffset;
				y = y*TILE_SIZE - yOffset;

				if(x <= lastClick.offsetX && lastClick.offsetX < x + TILE_SIZE*2 && y <= lastClick.offsetY && lastClick.offsetY < y + TILE_SIZE*2)
				{
					labelTarget = mainRoom.parent.exits[i];
					break
				}
			}
		}
	}

	// should be refactored into label entity
	if(mainRoom.isRoom && lastClick.x != undefined)
	{
		let roomLabelX = mainRoom.bounds.reduce((acc,p) => Math.min(acc,p[0]), Infinity) * TILE_SIZE - xOffset;
		let roomLabelY = mainRoom.bounds.reduce((acc,p) => Math.min(acc,p[1]), Infinity) * TILE_SIZE - yOffset;

		if (roomLabelX <= lastClick.offsetX && lastClick.offsetX <= roomLabelX+30
			&& roomLabelY <= lastClick.offsetY && lastClick.offsetY <= roomLabelY+30)
		{
			labelTarget = mainRoom.parent;
		}
	}

	if(labelTarget && charBuffer.length)
	{
		labelTarget.label = labelTarget.label || "";
		labelTarget.label = (labelTarget.label + charBuffer).replace(/.[\b]|^[\b]+/g,"");
	}
	if(!mainRoom.isRoom)
	{
		labelTarget = null;
	}


	charBuffer = "";
	lastClick = {};
}


// DEF dungeons

let totalTorches = -1;
let litTorches = new Set();

let dungeonTemplates = [];

let transitionPercent = -1;



function buildTransTerrain(localCoordinates, trans, tileIMG)
{
	let lines = trans.line.map(x => lib.addV2(x, localCoordinates));
	let bounds = [lines[0], lines[1]];
	let typ = "vtransition";
	let left = 0;
	let right = 1;

	if(lines[0][0] == lines[1][0])
	{
		typ = "htransition";
		if(lines[0][1] < lines[1][1])
		{
			right = 0;
			left = 1
		}
	}
	else
	{
		if(lines[0][0] < lines[1][0])
		{
			right = 0;
			left = 1
		}
	}

	let area = {
		bounds,
		type: typ,
		left,
		right
	}

	let diff = lib.addV2(bounds[1], lib.scaleV2(bounds[0], -1)); 

	diff = [diff[1], -diff[0]];
	bounds.push(lib.addV2(bounds[1], diff));

	diff = lib.addV2(bounds[2], lib.scaleV2(bounds[1], -1));
	diff = [diff[1], -diff[0]];
	bounds.push(lib.addV2(bounds[2], diff));

	area.sprites = [
		{type: "tile", bounds, img: tileIMG || "GRASS"}
	]

	if(trans.connectsTo != undefined)
	{
		area.connectsTo = trans.connectsTo;
		area.connectsToLine = [bounds[2], bounds[3]];
	}
	return area;
}


function loadDungeon(dungeonNo)
{
	let dungeon = allTerrain[dungeonNo];
	terrain = [dungeon];
	transitioningFromDungeon = inDungeon;
	inDungeon = dungeonNo;

	while(!lib.isPointInShape([x,y], dungeon.bounds))
	{
		if(x == y)
			x += 1
		else
			y+= 1;
	}


	let tileIMG = dungeon.sprites.filter(x => x.type == "tile").map(x => x.img)[0] || "GRASS";

	//if(dungeon.entrance)
	//	terrain.push(buildTransTerrain({line: dungeon.entrance}, tileIMG));

	for(let exit of dungeon.exits)
	{
		terrain.push(buildTransTerrain([0,0], exit, tileIMG));
	}
}

function transitionDungeons(transitionArea)
{
	let loadedTerrain = allTerrain[transitionArea.connectsTo];

	console.log("Loading " + transitionArea.connectsTo);
	inDungeon = transitionArea.connectsTo;


	loadedTerrain.localCoordinates = lib.addV2(transitionArea.connectsToLine[0], lib.scaleV2(loadedTerrain.entrance[0], -1));
	let diff = loadedTerrain.localCoordinates;

	// should be refactored
	/*copy.sprites.forEach(s => {
		s.bounds = s.bounds.map(p => lib.addV2(p, diff))
		if(s.img == "TORCH" && litTorches.has(inDungeon))
		{
			s.img = "TORCHL";
		}
	});*/

	for(let area of terrain)
	{
		area.transition = "out";
		if(area == transitionArea && area.left == 1)
		{
			area.transition = "right";
		}
		if(area == transitionArea && area.right == 1)
		{
			area.transition = "left";
		}
	}

	transitionPercent = 0;

	loadedTerrain.transition = "in";
	terrain.push(loadedTerrain);


	let tileIMG = loadedTerrain.sprites.filter(x => x.type == "tile").map(x => x.img)[0] || null;
	
	for(let exit of loadedTerrain.exits)
	{
		let area = buildTransTerrain(diff, exit, tileIMG);
		area.transition = "in";
		terrain.push(area);
	}

	delete transitionArea.connectsTo;
	delete transitionArea.connectsToLine;
}

let inDungeon = -1;
let transitioningFromDungeon = -1;

//loadDungeon(8)



function isPointInTerrain(point)
{
	for(let area of terrain)
	{	
		if(area.transition == "out")
			continue;

		if(lib.isPointInShape(point, localizedBounds(area)))
		{
			return true;
		}
	}

	return false;
}


let counterTS = null;
let counter = -1;


let CANVAS_WIDTH = 1200;
let CANVAS_HEIGHT = 800;

function getExitArrowCoords(exit)
{

	let minX = exit.line.reduce((acc,p) => Math.min(acc,p[0]), Infinity) - .5;
	let minY = exit.line.reduce((acc,p) => Math.min(acc,p[1]), Infinity) - .5;
	var img;

	if(exit.line[0][1] == exit.line[1][1])
	{
		img = (exit.line[0][0] > exit.line[1][0]) ? "ARROW_D" : "ARROW_U";
		minX += 1
	}
	else
	{
		minY += 1;
		img = (exit.line[0][1] > exit.line[1][1]) ? "ARROW_L" : "ARROW_R";
	}

	return [minX, minY, img];
}

var menuScreenButtons = [
	{
		text: "Small (15 rooms)",
		size: "normal",
		nodeCount: 6,
		y: 350
	},
	{
		text: "Medium (25 rooms)",
		size: "normal",
		nodeCount: 25,
		y: 400
	},
	{
		text: "Large (50 rooms)",
		size: "normal",
		nodeCount: 50,
		y: 450
	},
	{
		text: "Giant (100 rooms)",
		size: "normal",
		nodeCount: 100,
		y: 500
	}
];

function menuScreenUpdate()
{
	for(let button of menuScreenButtons)
	{
		if(button.size == "normal")
		{
			if(CANVAS_WIDTH/2-150 <= lastClick.offsetX && lastClick.offsetX <= CANVAS_WIDTH/2+150 
				&& button.y <= lastClick.offsetY && lastClick.offsetY <= button.y+30)
			{
				// button was clicked
				inIntroScreen = false;

				var maze = generateDungeon(button.nodeCount, SEED);
				allTerrain = maze.dungeons;
				startStopPoints = maze.startStopPoints;

				loadDungeon(startStopPoints[0]);

				console.log("yes")
			}
		}
	}
}

function menuScreenDraw()
{
	ctx.globalCompositeOperation = "source-over";
	ctx.clearRect(0, 0,CANVAS_WIDTH, CANVAS_HEIGHT);

	ctx.fillStyle = "#FFFFFF";

	ctx.font = "50pt FascinateInline";
	ctx.textAlign = "center";
	ctx.fillText("Maze Game", CANVAS_WIDTH/2, 300);

	ctx.font = "16pt Arial";

	for(let button of menuScreenButtons)
	{
		if(button.size == "normal")
		{
			ctx.fillStyle = "#888888";
			ctx.fillRect(CANVAS_WIDTH/2-150, button.y, 300, 30);

			if(CANVAS_WIDTH/2-150 <= mouse.x && mouse.x <= CANVAS_WIDTH/2+150 && button.y <= mouse.y && mouse.y <= button.y+30)
			{
				ctx.fillStyle = "#ff751a";
			}
			else
			{
				ctx.fillStyle = "#FFFFFF";
			}

			
			ctx.fillRect(CANVAS_WIDTH/2-150, button.y, 300-2, 30-2);

			ctx.fillStyle = "#000000";
			ctx.fillText(button.text, CANVAS_WIDTH/2, button.y+21);
		}
	}

	//ctx.fillRect(100, 100, 200, 200);
	//inMazeDraw();

	ctx.fillStyle = "#0000FF";
}

xOffset = 0;
yOffset = 0;

let charDir = "D";

function inMazeDraw()
{	
	let mainRoom = terrain.filter(x => x.isRoom)[0] || {}
	ctx.clearRect(0, 0,CANVAS_WIDTH, CANVAS_HEIGHT);


	let lbI = Math.floor(x - CANVAS_WIDTH/2/TILE_SIZE - 1)
	let ubI = Math.floor(x + CANVAS_WIDTH/2/TILE_SIZE + 2);

	let lbJ= Math.floor(y - CANVAS_HEIGHT/2/TILE_SIZE - 1)
	let ubJ = Math.floor(y + CANVAS_HEIGHT/2/TILE_SIZE + 2);

	xOffset = Math.floor(x*TILE_SIZE) - CANVAS_WIDTH/2;
	yOffset = Math.floor(y*TILE_SIZE) - CANVAS_HEIGHT/2;

	// draw square tiles
	for(let dung of terrain)
	{
		let bounds = dung.bounds;

		if(dung.localCoordinates)
			bounds = bounds.map(x => lib.addV2(x, dung.localCoordinates));

		// draw tiles + images
		for(let sprite of dung.sprites)
		{

			let spriteBounds = sprite.bounds;
			if(dung.localCoordinates)
				spriteBounds = spriteBounds.map(x => lib.addV2(x, dung.localCoordinates));

			if(sprite.type == "tile")
			{
				let minX = spriteBounds.reduce((acc,p) => Math.min(acc,p[0]), Infinity);
				let minY = spriteBounds.reduce((acc,p) => Math.min(acc,p[1]), Infinity);
				let maxX = spriteBounds.reduce((acc,p) => Math.max(acc,p[0]), -Infinity);
				let maxY = spriteBounds.reduce((acc,p) => Math.max(acc,p[1]), -Infinity);


				for(let i = minX; i < maxX; i++)
				{
					for(let j = minY; j < maxY; j++)
					{
						if(lib.isPointInShape([i+.5, j+.5], bounds) && dung.fade != 1)
						{
							ctx.globalCompositeOperation = "source-over";
							ctx.drawImage(engine.getSprite(sprite.img), i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset);
						}	
					}
				}
			}
			else if(sprite.type == "img")
			{
				let minX = spriteBounds.reduce((acc,p) => Math.min(acc,p[0]), Infinity);
				let minY = spriteBounds.reduce((acc,p) => Math.min(acc,p[1]), Infinity);

				ctx.drawImage(engine.getSprite(sprite.img), minX*TILE_SIZE - xOffset, minY*TILE_SIZE - yOffset);
			}
		}
	}

	let blink = (new Date().getTime() % 1000) >= 500;

	for(let dung of terrain)
	{
		let minX = dung.bounds.reduce((acc,p) => Math.min(acc,p[0]), Infinity) * TILE_SIZE - xOffset;
		let minY = dung.bounds.reduce((acc,p) => Math.min(acc,p[1]), Infinity) * TILE_SIZE - yOffset;

		if(dung.isRoom)
		{
			ctx.drawImage(engine.getSprite("TAG"), minX, minY+3);
		}
	

		if(dung.parent && (dung.parent.label || dung.parent == labelTarget))
		{
			//let minX = dung.bounds.reduce((acc,p) => Math.min(acc,p[0]), Infinity);
			//let minY = dung.bounds.reduce((acc,p) => Math.min(acc,p[1]), Infinity);

			ctx.fillStyle = "#0000FF";
			ctx.font = "20px Arial";
			ctx.textAlign = "left";

			let label = dung.parent.label || "";

			if(labelTarget == dung.parent && blink)
			{
				label += "_"
			}

			ctx.fillText(label, minX + 35, minY+25);
			
		}

		// draw exit arrows
		if(dung.isRoom && false)
		{
			for(let i=0; i < dung.exits.length; i++)
			{
				let [minX,minY,img] = getExitArrowCoords(dung.exits[i]);

				let xLowBound = minX*TILE_SIZE - xOffset;
				let yLowBound = minY*TILE_SIZE - yOffset

				if(xLowBound <= mouse.x && mouse.x <= xLowBound + TILE_SIZE && yLowBound <= mouse.y && mouse.y <= yLowBound + TILE_SIZE)
				{
					img += "H";
				}
				ctx.drawImage(engine.getSprite(img), xLowBound, yLowBound);
				

				if(dung.parent.exits[i].label || dung.parent.exits[i] == labelTarget)
				{
					ctx.fillStyle = "#0000FF";
					ctx.font = "20px Arial";
					ctx.textAlign = "center";

					let label = dung.parent.exits[i].label || "";
					let blinkOffset = 0;
					if(dung.parent.exits[i] == labelTarget && blink)
					{
						blinkOffset = 6;
						label += "_";
					}

					ctx.fillText(
						label,
						minX*TILE_SIZE - xOffset + TILE_SIZE/2 + blinkOffset,
						minY*TILE_SIZE - yOffset+TILE_SIZE+20);
				}

			}

		}	
	
	}



	for(let dung of terrain)
	{
		if(dung.entities && dung.entities.length)
		{
			let offset = dung.localCoordinates || [0,0];
			let p1 = lib.addV2([-x,-y], offset);
			let xyOfRoom = lib.addV2(
				lib.scaleV2(p1, TILE_SIZE),
				[CANVAS_WIDTH/2, CANVAS_HEIGHT/2]
			);

			for(let entity of dung.entities)
			{
				entity.draw(ctx, xyOfRoom);
			}
		}
	}

	

	// draw character

	ctx.drawImage(engine.getSprite("CHAR_" + charDir), CANVAS_WIDTH/2-20, CANVAS_HEIGHT/2-20); 
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "#0000FF";
	//ctx.fillRect(CANVAS_WIDTH/2-20, CANVAS_HEIGHT/2-20, 40, 40)

	// draw shading
	for(let dung of terrain)
	{
		for(let sprite of dung.sprites)
		{
			if(sprite.type != "tile")
				continue;

			let spriteBounds = sprite.bounds;
			if(dung.localCoordinates)
				spriteBounds = spriteBounds.map(x => lib.addV2(x, dung.localCoordinates));

			let minX = spriteBounds.reduce((acc,p) => Math.min(acc,p[0]), Infinity);
			let minY = spriteBounds.reduce((acc,p) => Math.min(acc,p[1]), Infinity);
			let maxX = spriteBounds.reduce((acc,p) => Math.max(acc,p[0]), -Infinity);
			let maxY = spriteBounds.reduce((acc,p) => Math.max(acc,p[1]), -Infinity);

			ctx.globalCompositeOperation = "destination-out";
			for(let i = minX; i < maxX; i++)
			{
				for(let j = minY; j < maxY; j++)
				{
					if(lib.isPointInShape([i+.5, j+.5], spriteBounds) && dung.fade != 1)
					{

						if(dung.fade != 0 && dung.fade != undefined)
						{
							//ctx.fillStyle = "rgba(0,0,0, " + dung.fade + ")";
							
							let gradient = ctx.createLinearGradient(0, 0, 0, 100);

							gradient.addColorStop(0, "rgba(0, 0, 0, " + dung.fade + ")");
							gradient.addColorStop(1, "rgba(0, 0, 0, " + dung.fade +")");

							ctx.fillStyle = gradient;
							ctx.fillRect(i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset, TILE_SIZE, TILE_SIZE);
						}
					}	
				}
			}
		}	


		if(dung.type == "htransition")
		{
			let bounds = localizedBounds(dung);

			let i = bounds.reduce((a,b) => Math.min(a,b[0]), Infinity);
			let j = bounds.reduce((a,b) => Math.min(a,b[1]), Infinity);
		
			ctx.globalCompositeOperation = "destination-out";
			let gradient = ctx.createLinearGradient(i*TILE_SIZE - xOffset+ 2*TILE_SIZE, j*TILE_SIZE - yOffset, i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset);

			gradient.addColorStop(0, "rgba(0, 0, 0, "+ dung.left + ")");
			gradient.addColorStop(1, "rgba(0, 0, 0, "+ dung.right + ")");
			ctx.fillStyle = gradient;

			ctx.fillRect(i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset, TILE_SIZE*2, TILE_SIZE*2);
		}
		if(dung.type == "vtransition")
		{
			let bounds = localizedBounds(dung);

			let i = bounds.reduce((a,b) => Math.min(a,b[0]), Infinity);
			let j = bounds.reduce((a,b) => Math.min(a,b[1]), Infinity);

			ctx.globalCompositeOperation = "destination-out";
			var gradient;

			try
			{
				gradient = ctx.createLinearGradient(i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset, i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset + 2*TILE_SIZE);

				gradient.addColorStop(0, "rgba(0, 0, 0, "+ dung.left + ")");
				gradient.addColorStop(1, "rgba(0, 0, 0, "+ dung.right + ")");
				ctx.fillStyle = gradient;
				ctx.fillRect(i*TILE_SIZE - xOffset, j*TILE_SIZE - yOffset, TILE_SIZE*2, TILE_SIZE*2);
			}
			catch(e)
			{
				console.log(i*TILE_SIZE)
				console.log(dung.bounds)
				throw e
			}
		}
	}

	// draw room count
	ctx.globalCompositeOperation = "source-over";
	ctx.textAlign = "left";
	ctx.fillStyle = '#FFFFFF';
	ctx.font = "36pt Arial";
	ctx.fillText(litTorches.size + "/" + totalTorches, 10, 46);
	//ctx.fillText("ahyyyyyyyyyyyy", 0, 36);
}

gameLoop();