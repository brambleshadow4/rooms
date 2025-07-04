import * as engine from "./engine.js";
import * as lib from "./lib.js";


engine.addImage("ARROW_L","arrow_l.png");
engine.addImage("ARROW_R","arrow_r.png");
engine.addImage("ARROW_U","arrow_u.png");
engine.addImage("ARROW_D","arrow_d.png");
engine.addImage("ARROW_LH","arrow_lh.png");
engine.addImage("ARROW_RH","arrow_rh.png");
engine.addImage("ARROW_UH","arrow_uh.png");
engine.addImage("ARROW_DH","arrow_dh.png");

export default class ArrowEntity
{
	update(gameState)
	{
		//gameState.charPos 
		
	};

	draw(ctx, roomXY)
	{
		ctx.drawImage(engine.getSprite("ARROW_"+ this.direction), roomXY[0]+this.position[0]*64-32, roomXY[1]+this.position[1]*64-32);
	};

	constructor(exit)
	{
		console.log(exit)
		this.exit = exit;

		if(exit.line[0][0] < exit.line[1][0])
			this.direction = "U";
		if(exit.line[0][0] > exit.line[1][0])
			this.direction = "D";
		if(exit.line[0][1] < exit.line[1][1])
			this.direction = "R";
		if(exit.line[0][1] > exit.line[1][1])
			this.direction = "L";

		this.position = lib.scaleV2(lib.addV2(exit.line[0], exit.line[1]), 1/2);
		


	}
}

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