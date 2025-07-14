import * as engine from "./engine.js";
import * as lib from "./lib.js";


engine.addImage("DOOR","door.png");


export default class DoorEntity
{

	update(gameState)
	{
		if(gameState.totalTorches == gameState.litTorches.size)
			this.closed = false;
	};

	isPointInEntity(coordinates)
	{
		if(!this.closed)
			return false;
		
		return (this.position[0]-1 <= coordinates[0] && coordinates[0] <= this.position[0]+1 && this.position[1]-2 <= coordinates[1] &&  coordinates[1] <= this.position[1]+1)	
	}

	draw(ctx, roomXY)
	{
		if(this.closed)
		{
			ctx.drawImage(engine.getSprite("DOOR"), roomXY[0]+this.position[0]*64-64, roomXY[1]+this.position[1]*64-128); 

			ctx.textAlign = "center";
			ctx.fillStyle = "#000000";
			ctx.font = "12pt Arial";

			ctx.fillText("You must light all the torches to open the door", roomXY[0]+this.position[0]*64, roomXY[1]+this.position[1]*64+64+20);
		}

		
		
	};

	constructor(position)
	{
		this.closed = true;
		this.type = "door";
		this.position = position;
	}
}
