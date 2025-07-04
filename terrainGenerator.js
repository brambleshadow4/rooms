

let rightTurnTemplate = {
	bounds: [
		[0,0],
		[4,0],
		[4,2],
		[2,2],
		[2,4],
		[0,4]
	],
	exits: [
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
	exits: [
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
	exits: [
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
	exits: [
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
	exits: [
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
	exits: [
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
	entrance: [[3,20],[1,20]],
	exits: [
		{line: [[11,20],[9,20]]}
	],
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

	if(area.exits)
	{
		area.exits = area.exits.map(exit => {return {line: [
			[exit.line[0][1], maxX-exit.line[0][0]],
			[exit.line[1][1], maxX-exit.line[1][0]],
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
	let compV2 = addV2(addV2(b2, a), scaleV2(addV2(b, a2), -1));
	return compV2[0] == 0 && compV2[1] == 0;
}

function isExitParallelWithExit(exit, area)
{
	let allExits = area.exits.map(x => x.line);
	allExits.push(area.entrance);

	let diff = scaleV2(addV2(exit[0], scaleV2(exit[1],-1)), 2);
	let line1 = exit.map(p => addV2(p, diff));
	let line2 =  exit.map(p => addV2(p, scaleV2(diff,-1)));

	for(let ex1 of allExits)
	{
		if(equalV2(exit[0], ex1[0]) && equalV2(exit[1], ex1[1]))
			continue;

		if(equalV2(line1[0], ex1[0]) && equalV2(line1[1], ex1[1]))
			return true;

		if(equalV2(line2[0], ex1[0]) && equalV2(line2[1], ex1[1]))
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
		exits: [
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

	area.exits = newExits

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds},
		{type: "img", img: "TORCH", bounds: [[3,2],[5,4]]} 
	];


	return area;
}

function smallSquareGenerator(rand, exits)
{
	let area = JSON.parse(JSON.stringify(smallSquareTemplate));
	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds} 
	];

	area.sprites.push({type: "img", img: "TORCH", bounds: [[2,2],[4,4]]});

	/*if(rand.random() > .5)
	{
		area.sprites.push({type: "img", img: "POND", bounds: [[2,2],[4,4]]});
	}*/

	return area;
}

function threeCellGenerator(rand, exitCount)
{
	let area = JSON.parse(JSON.stringify(threeCellTemplate));
	
	let rotations = Math.floor(rand.random()*4);
	let torchBounds = {bounds: [[0,0],[8,8],[1,1],[3,3]]};

	for(let j=0; j < rotations; j++)
	{
		area = rotateTemplate(area);
		torchBounds = rotateTemplate(torchBounds);
	}

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds},
		{type: "img", img: "TORCH", bounds: torchBounds.bounds.slice(2)} 
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
		newExits.push(area.exits[e]);
	}

	area.exits = newExits

	return area;
}

function twoCellGenerator(rand, exitCount)
{
	let area = JSON.parse(JSON.stringify(twoCellTemplate));
	let torchBounds = [[3,0],[5,3]];

	if(rand.random() >= .5)
	{
		area = rotateTemplate(area);
		torchBounds = [[1,2],[3,4]];
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
		newExits.push(area.exits[e]);
	}

	area.exits = newExits

	area.sprites = [
		{type: "tile", img: allTiles[Math.floor(rand.random()*allTiles.length)], bounds: area.bounds},
		{type: "img", img: "TORCH", bounds: torchBounds} 
	];

	return area;
}


function generateDungeonMap(nodes, goldRoomNode, rand)
{
	// create main maps

	let dungeons = [];

	for(let i=0; i < nodes.length; i++)
	{
		let n = nodes[i];

		if(n == goldRoomNode)
		{
			dungeons.push(goldRoom);
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
	
		// select entrance
		let j = Math.floor(rand.random() * area.exits.length);
		area.entrance = area.exits.splice(j,1)[0].line;

		dungeons.push(area);
	}

	// generate position of all exists
	// this needs to happen first to avoid having the u-turn overlap with exits

	// add exits and connector dungeons
	for(let i=0; i < nodes.length; i++)
	{
		let source = dungeons[i]
		let allExits = source.exits;
		source.exits = [];

		if(allExits.length < nodes[i].linksTo.length)
		{
			throw new Error("need a bigger room")
		}

		// this connection naively works, but

		for(let node of nodes[i].linksTo)
		{	
			let j = Math.floor(rand.random() * allExits.length);

			let exit = allExits.splice(j,1)[0];
			source.exits.push(exit);

			exit.connectsTo = node.id;
		}
	}


	// add exits and connector dungeons
	for(let i=0; i < nodes.length; i++)
	{
		let source = dungeons[i];

		let tileIMG = source.sprites.filter(x => x.type == "tile").map(x => x.img)[0] || "GRASS";

		destinationLoop: for(let nextExit of source.exits)
		{	
			
			var destinationID = nextExit.connectsTo
			var destination = dungeons[destinationID];

			// figure out what transition terrain we need
			let a = destination.entrance[0];
			let b = destination.entrance[1]
			let a2 = nextExit.line[1]
			let b2 = nextExit.line[0];

			let diff1 = addV2(a, scaleV2(b, - 1));
			let diff2 = addV2(a2, scaleV2(b2, - 1));


			if(doesEntranceLineUpWithExit(destination.entrance, nextExit.line))
			{
				// lines are parallel - the naive conneciton works!

			}
			else if (diff1[0]*diff2[0] + diff1[1]*diff2[1] == 0)
			{
				// lines are perpendicular - use a 90 degree turn

				let connectorArea = JSON.parse(JSON.stringify(rightTurnTemplate));



				for(let k=0; k<4; k++)
				{	
					if(doesEntranceLineUpWithExit(destination.entrance, connectorArea.exits[0].line) && 
						doesEntranceLineUpWithExit(nextExit.line, connectorArea.exits[1].line))
					{
						nextExit.connectsTo = dungeons.length;
						connectorArea.entrance = connectorArea.exits[1].line
						connectorArea.exits.splice(1,1)[0];
						connectorArea.exits[0].connectsTo = destinationID;
						dungeons.push(connectorArea)
						connectorArea.sprites = [{img: tileIMG, bounds: connectorArea.bounds, type: "tile"}]


						continue destinationLoop;
					}

					if(doesEntranceLineUpWithExit(destination.entrance, connectorArea.exits[1].line) && 
						doesEntranceLineUpWithExit(nextExit.line, connectorArea.exits[0].line))
					{
						nextExit.connectsTo = dungeons.length;
						connectorArea.entrance = connectorArea.exits[0].line
						connectorArea.exits.splice(0,1)[0];
						connectorArea.exits[0].connectsTo = destinationID;
						dungeons.push(connectorArea)
						connectorArea.sprites = [{img: tileIMG, bounds: connectorArea.bounds, type: "tile"}]
						continue destinationLoop;
					}

					connectorArea = rotateTemplate(connectorArea);
				}

				throw new Error("Failed to find a good rotation")
			}
			else
			{
				// u turn


				let tooClose = isExitParallelWithExit(destination.entrance, destination) || isExitParallelWithExit(nextExit.line, source)
				let connectorArea = tooClose ? uTurnLongTemplate : uTurnTemplate;

				connectorArea = JSON.parse(JSON.stringify(connectorArea));

				for(let k=0; k<4; k++)
				{	
					if(doesEntranceLineUpWithExit(destination.entrance, connectorArea.exits[0].line) && 
						doesEntranceLineUpWithExit(nextExit.line, connectorArea.exits[1].line))
					{
						let no = Math.floor(rand.random() * 2);
						let no2 = 1- no;

						nextExit.connectsTo = dungeons.length;
						connectorArea.entrance = connectorArea.exits[no].line
						connectorArea.exits.splice(no,1)[0];
						connectorArea.exits[0].connectsTo = destinationID;
						dungeons.push(connectorArea)
						connectorArea.sprites = [{img: tileIMG, bounds: connectorArea.bounds, type: "tile"}]
						continue destinationLoop;
					}

					connectorArea = rotateTemplate(connectorArea);
				}

				throw new Error("Failed to find a good rotation")
			}		
		}
	}

	return dungeons;

	// create connectors
}

function generateCompleteDungeon(node_count, seed)
{
	seed = seed || new Date().getTime();
	let rand = new MersenneTwister(seed);

	let [nodemap, startStopPoints] = generateNodes(rand,node_count);

	totalTorches = node_count;

	let goldRoomNode = {id: node_count, linksTo: [nodemap[startStopPoints[0]]]};

	nodemap.push(goldRoomNode);
	nodemap[startStopPoints[1]].linksTo.push(goldRoomNode);

	return {dungeons: generateDungeonMap(nodemap, goldRoomNode, rand), startStopPoints};
}