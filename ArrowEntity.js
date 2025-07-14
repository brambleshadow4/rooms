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

const dirOffset = {
	"U": -1,
	"D": 10,
	"L": 6,
	"R": 6
}

export default class ArrowEntity
{
	update(gameState)
	{
		//gameState.charPos 
		
	};

	draw(ctx, roomXY)
	{
		ctx.drawImage(engine.getSprite("ARROW_"+ this.direction), roomXY[0]+this.position[0]*64-32, roomXY[1]+this.position[1]*64-32);

		ctx.font = "16pt Arial";
		ctx.fillStyle = "#0000FF";
		ctx.textAlign = "center";
		ctx.fillText(this.label, roomXY[0]+this.position[0]*64, roomXY[1]+this.position[1]*64 + dirOffset[this.direction]);
	};

	constructor(exit)
	{
		this.exit = exit;
		exit.arrowEntity = this;

		if(exit.line[0][0] < exit.line[1][0])
			this.direction = "U";
		if(exit.line[0][0] > exit.line[1][0])
			this.direction = "D";
		if(exit.line[0][1] < exit.line[1][1])
			this.direction = "R";
		if(exit.line[0][1] > exit.line[1][1])
			this.direction = "L";

		this.position = lib.scaleV2(lib.addV2(exit.line[0], exit.line[1]), 1/2);
		this.visited = false;
		this.label = "";
	}
}