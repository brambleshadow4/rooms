import * as lib from "./lib.js";
import {generateNodes} from "./mazeGenerator.js"
import TorchEntity from "./TorchEntity.js";
import ArrowEntity from "./ArrowEntity.js";
import DoorEntity from "./DoorEntity.js";

let rightTurnTemplate = {
	bounds: [
		[0,0],
		[4,0],
		[4,2],
		[2,2],
		[2,4],
		[0,4]
	],
	localCoordinates: [0,0],
	transitionBoundaries: [
		{line: [[4,0],[4,2]]},
		{line: [[2,4],[0,4]]},
	]
}

let uTurnTemplate = {
	bounds: [
		[0,0],
		[6,0],
		[6,2],
		[0,2],
	],
	localCoordinates: [0,0],
	transitionBoundaries: [
		{line: [[6,2],[4,2]]},
		{line: [[2,2],[0,2]]},
	]
}

let uTurnLongTemplate = {
	bounds: [
		[0,0],
		[8,0],
		[8,2],
		[0,2],
	],
	localCoordinates: [0,0],
	transitionBoundaries: [
		{line: [[8,2],[6,2]]},
		{line: [[2,2],[0,2]]},
	]
}


//////////////////////////////////////



let smallSquareTemplate = {
	bounds: [
		[1,1],
		[5,1],
		[5,5],
		[1,5]
	],
	localCoordinates: [0,0],
	transitionBoundaries: [
		{line: [[2,1],[4,1]]}, // North
		{line: [[4,5],[2,5]]}, // South

		{line: [[5,2],[5,4]]}, // East
		{line: [[1,4],[1,2]]}, // West
	],
}

let twoCellTemplate = {
	bounds: [
		[0,0],
		[8,0],
		[8,4],
		[0,4]
	],
	localCoordinates: [0,0],
	transitionBoundaries: [
		{line: [[8,1],[8,3]]}, // East
		{line: [[5,0],[7,0]]}, // North
		{line: [[7,4],[5,4]]}, // South

		{line: [[0,3],[0,1]]}, // West
		{line: [[1,0],[3,0]]}, // North
		{line: [[3,4],[1,4]]}, // South
	],
};

let threeCellTemplate = {
	bounds: [
		[0,0],
		[8,0],
		[8,4],
		[4,4],
		[4,8],
		[0,8]
	],
	localCoordinates: [0,0],
	transitionBoundaries: [
		{line: [[5,0],[7,0]]}, // North
		{line: [[8,1],[8,3]]}, // East

		{line: [[1,0],[3,0]]}, // North
		{line: [[0,3],[0,1]]}, // West

		{line: [[0,7],[0,5]]}, // West
		{line: [[3,8],[1,8]]}, // South
		
	],
}

let goldRoom = {
	bounds: [
		[2,4],
		[10,4],
		[10,12],
		[7,12], // lower room
		[7,16],
		[12,16],
		[12,20],
		[0,20],
		[0,16],
		[5,16],
		[5,12],
		[2,12]
	],
	localCoordinates: [0,0],
	entrance: [[7,20],[5,20]],
	transitionBoundaries: []
	//transitionBoundaries: [[[7,20],[5,20]]]
};

goldRoom.sprites = [
	{type: "tile", bounds: goldRoom.bounds, img: "STONE_BRICK"},
	{type: "img", bounds: [[4,4],[8,4],[8,8],[4,8]], img: "GOLD"}
]



function rotateTemplate(areaTemplate)
{
	let area = JSON.parse(JSON.stringify(areaTemplate));

	let maxX = area.bounds.reduce((acc,[x,y]) => Math.max(x, acc), -1);
	area.bounds = area.bounds.map(([x,y]) => [y,maxX-x]);

	if(area.transitionBoundaries)
	{
		area.transitionBoundaries = area.transitionBoundaries.map(tb => {return {line: [
			[tb.line[0][1], maxX-tb.line[0][0]],
			[tb.line[1][1], maxX-tb.line[1][0]],
		]}});
	}
	

	return area;
}

function doesEntranceLineUpWithExit(line1, line2)
{
	let a = line1[1]
	let b = line1[0]
	let a2 = line2[0]
	let b2 = line2[1];
	let compV2 = lib.addV2(lib.addV2(b2, a), lib.scaleV2(lib.addV2(b, a2), -1));
	return compV2[0] == 0 && compV2[1] == 0;
}

function isExitParallelWithExit(exit, area)
{
	let allExits = area.exits.map(x => x.line);
	allExits.push(area.entrance);

	let diff = lib.scaleV2(lib.addV2(exit[0], lib.scaleV2(exit[1],-1)), 2);
	let line1 = exit.map(p => lib.addV2(p, diff));
	let line2 =  exit.map(p => lib.addV2(p, lib.scaleV2(diff,-1)));

	for(let ex1 of allExits)
	{
		if(lib.equalV2(exit[0], ex1[0]) && lib.equalV2(exit[1], ex1[1]))
			continue;

		if(lib.equalV2(line1[0], ex1[0]) && lib.equalV2(line1[1], ex1[1]))
			return true;

		if(lib.equalV2(line2[0], ex1[0]) && lib.equalV2(line2[1], ex1[1]))
			return true;
	}
	return false;
}

let roomGenerators = [
	{
		min: 2,
		max: 8,
		weight: 1,
		generate: largeSquareGenerator
	},
	{
		min: 2,
		max: 6,
		weight: 2,
		generate: twoCellGenerator
	},
	{
		min: 2,
		max: 6,
		weight: 2,
		generate: threeCellGenerator
	},
	{
		min: 2,
		max: 4,
		weight: 2,
		generate: smallSquareGenerator
	}
];

let allTiles = ["GRASS","STONE_BRICK","SAND"]

function largeSquareGenerator(rand, exitCount)
{
	let area = JSON.parse(JSON.stringify({
		bounds: [
			[0,0],
			[8,0],
			[8,8],
			[0,8]
		],
		localCoordinates: [0,0],
		transitionBoundaries: [
			{line: [[0,3],[0,1]]}, // West
			{line: [[1,0],[3,0]]}, // North
			
			{line: [[5,0],[7,0]]}, // North
			{line: [[8,1],[8,3]]}, // East

			{line: [[8,5],[8,7]]}, // East
			{line: [[7,8],[5,8]]}, // South


			{line: [[3,8],[1,8]]}, // South
			{line: [[0,7],[0,5]]}, // West	
		],
	}));

	let posExits = [0,1,2,3,4,5,6,7];
	let exitSet = new Set();

	for(let i=0; i<exitCount-1; i++)
	{
		let [e] = posExits.splice(Math.floor(rand.random() * posExits.length), 1);
		exitSet.add(e);
	}

	
	let crit1 = (exitSet.has(0) || exitSet.has(1)) && (exitSet.has(4) || exitSet.has(5));
	let crit2 = (exitSet.has(2) || exitSet.has(3)) && (exitSet.has(6) || exitSet.has(7));

	if(crit1 || crit2)
	{
		let [e] = posExits.splice(Math.floor(rand.random() * posExits.length), 1);
		exitSet.add(e);
	}
	else
	{
		let satisfiers = [];
		if((exitSet.has(0) || exitSet.has(1)) && !crit1)
		{
			satisfiers.push(4)
			satisfiers.push(5)
		}
		if((exitSet.has(4) || exitSet.has(5)) && !crit1)
		{
			satisfiers.push(0)
			satisfiers.push(1)
		}
		if((exitSet.has(2) || exitSet.has(3)) && !crit2)
		{
			satisfiers.push(6)
			satisfiers.push(7)
		}
		if((exitSet.has(6) || exitSet.has(7)) && !crit2)
		{
			satisfiers.push(2)
			satisfiers.push(3)
		}

		let [e] = satisfiers.splice(Math.floor(rand.random() * satisfiers.length), 1);
		exitSet.add(e);
	}


	let newExits = []
	for(let e of exitSet)
	{
		newExits.push(area.exits[e]);
	}

	area.transitionBoundaries = newExits;

	area.entities = [
		new TorchEntity([4,4])
	];

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds}
	];


	return area;
}

function smallSquareGenerator(rand, exits)
{
	let area = JSON.parse(JSON.stringify(smallSquareTemplate));
	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds}
	];

	area.entities = [
		new TorchEntity([3,3])
	];

	return area;
}

function threeCellGenerator(rand, exitCount)
{
	let area = JSON.parse(JSON.stringify(threeCellTemplate));
	
	let rotations = Math.floor(rand.random()*4);

	for(let j=0; j < rotations; j++)
	{
		area = rotateTemplate(area);
	}

	let torchBounds = [[2,2],[2,6],[6,6],[6,2]][rotations]

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds}
	];

	area.entities = [
		new TorchEntity(torchBounds)
	];

	let posExits = new Set([0,1,2,3,4,5]);
	let exitSet = new Set();

	let e1 = Math.floor(rand.random()*2)
	let e2 = Math.floor(rand.random()*2)+4;

	exitSet.add(e1)
	exitSet.add(e2);
	posExits.delete(e1);
	posExits.delete(e2);

	for(let i=2; i<exitCount; i++)
	{
		let [e] = [...posExits].splice(Math.floor(rand.random() * posExits.size), 1);
		posExits.delete(e)
		exitSet.add(e);
	}

	let newExits = []
	for(let e of exitSet)
	{
		newExits.push(area.transitionBoundaries[e]);
	}

	area.transitionBoundaries = newExits

	return area;
}

function twoCellGenerator(rand, exitCount)
{
	let area = JSON.parse(JSON.stringify(twoCellTemplate));
	let torchBounds = [4,2];

	if(rand.random() >= .5)
	{
		area = rotateTemplate(area);
		torchBounds = [2,4];
	}

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds},
	];


	let posExits = new Set([0,1,2,3,4,5]);
	let exitSet = new Set();

	for(let i=0; i<exitCount-1; i++)
	{
		let [e] = [...posExits].splice(Math.floor(rand.random() * posExits.size), 1);
		posExits.delete(e)
		exitSet.add(e);
	}

	let crit1 = (exitSet.has(0) || exitSet.has(1) || exitSet.has(2));
	let crit2 = (exitSet.has(3) || exitSet.has(4) || exitSet.has(5));

	if(crit1 && !crit2)
	{
		posExits.delete(0)
		posExits.delete(1)
		posExits.delete(2)
	}
	if(crit2 && !crit1)
	{
		posExits.delete(3)
		posExits.delete(4)
		posExits.delete(5)
	}

	let [e] = [...posExits].splice(Math.floor(rand.random() * posExits.count), 1);
	exitSet.add(e);


	let newExits = []
	for(let e of exitSet)
	{
		newExits.push(area.transitionBoundaries[e]);
	}

	area.transitionBoundaries = newExits;


	area.entities = [
		new TorchEntity(torchBounds)
	]

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds}
		
	];

	return area;
}


function convertNodesToDungeon(nodes, goldRoomNode, rand)
{
	// create main maps

	let dungeons = [];

	for(let i=0; i < nodes.length; i++)
	{
		let n = nodes[i];
		if(n == goldRoomNode)
		{
			dungeons.push(goldRoom);
			goldRoom.entities = [new DoorEntity([6,15])];
			goldRoom.displayNo = "E";
			continue;
		}

		// select tile

		let exitCount = n.linksTo.length + 1;
		let possibleGenerators = roomGenerators.filter(gen => gen.min <= exitCount && exitCount <= gen.max);

		let sum = possibleGenerators.reduce((acc, gen) => acc + gen.weight, 0);
		let at = 0;

		if(possibleGenerators.length == 0)
			throw new Error("no template is big enough")


		var generator;
		for(let gen of possibleGenerators)
		{
			at += gen.weight/sum;
			if(rand.random() <= at)
			{
				generator = gen;
				break;
			}
		}

		let area = generator.generate(rand, exitCount);
		area.isRoom = true;
		area.id = i;
		area.displayNo = n.displayNo;

		if (area.entities){
			let torch = area.entities.filter(x => x.type == "torch")[0];
			if(torch)
				torch.label = area.displayNo;
		}
	
		// select entrance
		let j = Math.floor(rand.random() * area.transitionBoundaries.length);
		area.entrance = area.transitionBoundaries.splice(j,1)[0].line;

		dungeons.push(area);
	}

	// generate position of all exits
	// this needs to happen first to avoid having the u-turn overlap with exits

	// add exits and connector dungeons
	for(let i=0; i < nodes.length; i++)
	{
		let source = dungeons[i]
		let allExits = source.transitionBoundaries;
		source.transitions = [];
		source.exits = [];

		if(allExits.length < nodes[i].linksTo.length)
		{
			throw new Error("need a bigger room")
		}


		for(let node of nodes[i].linksTo)
		{	
			let j = Math.floor(rand.random() * allExits.length);
			let boundary = allExits.splice(j,1)[0];
			source.exits.push({line: boundary.line, connectsTo: node.id});
		}

		// TODO Fix this
		//source.entities = (source.entities || []).concat(source.exits.map(ex => new ArrowEntity(ex)));
	}


	// add exits and connector dungeons
	for(let i=0; i < nodes.length; i++)
	{
		let source = dungeons[i];

		let tileIMG = source.sprites.filter(x => x.type == "tile").map(x => x.img)[0] || "GRASS";

		for(let nextExit of source.exits)
		{	
			let destination = dungeons[nextExit.connectsTo];
			let destinationBoundary = destination.entrance;
			connectDungeons(dungeons, tileIMG, source, nextExit.line, destination, destinationBoundary, false);
		}
	}

	return dungeons;

	// create connectors
}

function connectDungeons(dungeonArr, tileIMG, dung1, boundary1, dung2, boundary2, twoWay)
{
	if(lib.getLineDirection(boundary1) == lib.dirRotate(lib.dirRotate(lib.getLineDirection(boundary2))))
	{
		// dungeons line up, connect them directly.
		let transition = {}
		transition[0] = {id: dung1.id, line: boundary1};
		transition[1] = {id: dung2.id, line: boundary2};

		dung1.transitions.push(transition);
		if(twoWay)
		{
			dung2.transitions.push(transition);
		}
	}
	else if (lib.getLineDirection(boundary1) == lib.getLineDirection(boundary2))
	{
		// u turn
		// TODO Find a different way to implement this
		//let tooClose = isExitParallelWithExit(destination.entrance, destination) || isExitParallelWithExit(nextExit.line, source)
		//let connectorArea = tooClose ? uTurnLongTemplate : uTurnTemplate;
		let connectorArea = JSON.parse(JSON.stringify(uTurnLongTemplate));
		connectorArea.transitions = [];

		for(let k=0; k<4; k++)
		{	
			let oppositeDir = lib.dirRotate(lib.dirRotate(lib.getLineDirection(boundary1)));

			if(oppositeDir != lib.getLineDirection(connectorArea.transitionBoundaries[0].line))
			{
				connectorArea = rotateTemplate(connectorArea);
				continue;
			}
				
			let no = 0;
			let no2 = 1 - no;

			let transitionID = dungeonArr.length;
			dungeonArr.push(connectorArea);

			let transition1 = {};
			transition1[0] = {id: dung1.id, line: boundary1};
			transition1[1] = {id: transitionID, line: connectorArea.transitionBoundaries[no].line};

			transition1.direction = transitionID;
			dung1.transitions.push(transition1);
			connectorArea.transitions.push(transition1);


			// TODO make it two way

			let transition2 = {};
			transition2[0] = {id: dung2.id, line: boundary2};
			transition2[1] = {id: transitionID, line: connectorArea.transitionBoundaries[no2].line};

			transition2.direction = dung2.id;
			connectorArea.transitions.push(transition2);
			connectorArea.sprites = [{type: "tile", bounds: connectorArea.bounds, img: tileIMG}]
			// TODO make it two way
			return;

			
		}

		throw new Error("Failed to find a good rotation")
	}
	else
	{
		let connectorArea = JSON.parse(JSON.stringify(rightTurnTemplate));
		connectorArea.transitions = [];

		let entrancDir = lib.dirRotate(lib.dirRotate(lib.getLineDirection(boundary1)));
		let exitDir = lib.dirRotate(lib.dirRotate(lib.getLineDirection(boundary2)));


		// 90 degree turn
		for(let k=0; k<4; k++)
		{	
			let connTransBound1 = connectorArea.transitionBoundaries[0].line;
			let connTransBound2 = connectorArea.transitionBoundaries[1].line;

			if(entrancDir == lib.getLineDirection(connTransBound1) && 
				exitDir == lib.getLineDirection(connTransBound2))
			{

				let transition1 = {};
				let transitionID = dungeonArr.length;
				dungeonArr.push(connectorArea);

				transition1[0] = {id: dung1.id, line: boundary1};
				transition1[1] = {id: transitionID, line: connTransBound1};

				transition1.direction = transitionID;
				dung1.transitions.push(transition1);
				connectorArea.transitions.push(transition1);
				// TODO make it two way

				let transition2 = {};
				transition2[0] = {id: dung2.id, line: boundary2};
				transition2[1] = {id: transitionID, line: connTransBound2};

				transition2.direction = dung2.id;
				connectorArea.transitions.push(transition2);
				connectorArea.sprites = [{type: "tile", bounds: connectorArea.bounds, img: tileIMG}]

				return;


				continue;
			}

			if(entrancDir == lib.getLineDirection(connTransBound2) && 
				exitDir == lib.getLineDirection(connTransBound1))
			{
				let transition1 = {};
				let transitionID = dungeonArr.length;
				dungeonArr.push(connectorArea);

				transition1[0] = {id: dung1.id, line: boundary1};
				transition1[1] = {id: transitionID, line: connTransBound2};

				transition1.direction = transitionID;
				dung1.transitions.push(transition1);
				connectorArea.transitions.push(transition1);
				// TODO make it two way

				let transition2 = {};
				transition2[0] = {id: dung2.id, line: boundary2};
				transition2[1] = {id: transitionID, line: connTransBound1};

				transition2.direction = dung2.id;
				connectorArea.transitions.push(transition2);
				connectorArea.sprites = [{type: "tile", bounds: connectorArea.bounds, img: tileIMG}]

				return;
			}

			connectorArea = rotateTemplate(connectorArea);
		}

		throw new Error("Failed to find a good rotation")
	}
}




export function generateDungeon(node_count, seed)
{
	seed = seed || new Date().getTime();
	let rand = new MersenneTwister(seed);

	let [nodemap, startStopPoints] = generateNodes(rand,node_count);

	console.log(nodemap.map(x => {return {id: x.id, linksTo: x.linksTo.map(y => y.id)}}));

	nodemap.forEach(x => {x.displayNo = x.id+1});

	let a = nodemap[startStopPoints[0]];
	let b = nodemap[0];
	let swap = a.displayNo;
	a.displayNo = b.displayNo;
	b.displayNo = swap;

	//totalTorches = node_count;

	let goldRoomNode = {id: node_count, displayNo: "E", linksTo: []};
	nodemap.push(goldRoomNode);
	nodemap[startStopPoints[1]].linksTo.push(goldRoomNode);

	return {dungeons: convertNodesToDungeon(nodemap, goldRoomNode, rand), startStopPoints};
}
