import * as engine from "./engine.js";
import * as lib from "./lib.js";

export default class TorchEntity
{
	update(gameState)
	{
		//gameState.charPos 
		let diff = lib.addV2(gameState.charPos, lib.scaleV2(this.position, -1));
		if(-.5 <= diff[0] && diff[0] <= .5 && -.5 <= diff[1] && diff[1] <= .5)
		{
			this.isLit = true;
		}
	};

	draw(ctx, roomXY)
	{
		if(this.isLit)
		{
			ctx.drawImage(engine.getSprite("TORCHL"), roomXY[0]+this.position[0]*64-64, roomXY[1]+this.position[1]*64-128); 
		}
		else
		{
			ctx.drawImage(engine.getSprite("TORCH"), roomXY[0]+this.position[0]*64-64, roomXY[1]+this.position[1]*64-128); 
		}
	};

	constructor(position)
	{
		this.position = position;
		this.isLit = false;
	}
}
