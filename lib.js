
/** @typedef {[Number, Number]} Vec2 */
export function addV2(v1, v2)
{
	if(!isVector(v1)){
		console.error(v1);
		throw new Error("v1 is not a vector")
	}
	if(v1[0] == undefined || v2 == undefined)
	{
		throw new Error()
	}
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

function isVector(v)
{
	if(v == undefined || v[0] == undefined || v[1] == undefined)
		return false;
	return true;
}

export function getLineDirection(line)
{
	console.log(line)
	let [p1, p2] = line;
	let dx = p2[0] - p1[0];
	let dy = p2[1] - p1[1];
	if(dx == 0 && dy == 0)
	{
		throw new Error("Invalid line");
	}
	if(dy == 0)
	{
		// dx > 0    --->
		return dx > 0 ? "right" : "left";
	}
	else
	{
		return dy > 0 ? "up" : "down";
	}
}

export function dirRotate(dir)
{
	let dirs = ["right", "down", "left", "up"];
	let i = dirs.indexOf(dir);
	return dirs[(i + 1) % 4];
}
export function dirRevRotate(dir)
{
	let dirs = ["right", "up", "left", "down"];
	let i = dirs.indexOf(dir);
	return dirs[(i + 1) % 4];
}


/**
 * @param {Vec2} v1
 * @param {Vec2} v2
 * @returns {Vec2}
 */
export function equalV2(v1,v2)
{
	return v1[0] == v2[0] && v1[1] == v2[1]
}

/**
 * @param {Vec2} x - The point
 * @param {Number} n - the amount to scale by
 * @returns {Vec2}
 */
export function scaleV2(v, n)
{
	if(!isVector(v)){
		console.error(v);
		throw new Error("v is not a vector")
	}
	return [n*v[0], n*v[1]];
}

export function isPointInShape(point, shape)
{
	let orientation = (p1,p2,p3) => Math.sign((p2[1] - p1[1])*(p3[0]-p2[0]) - (p2[0]-p1[0])*(p3[1]-p2[1]));

	function doLinesIntersect(p1, q1, p2, q2)
	{
		// https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
		let o1 = orientation(p1, q1, p2);
		let o2 = orientation(p1, q1, q2);
		let o3 = orientation(p2, q2, p1);
		let o4 = orientation(p2, q2, q1);

		if(o1 * o2 *o3 *o4 == 0)
		{
			return false;
			//console.log(p1 + " " + q1 + " " + p2 + " " + q2)
			//throw new Error("coliniear intersections not supported");
		}

		return (o1 != o2 && o3 != o4) 
	}

	let shapeLines = shape.map((p, i) => [p, shape[(i+1) % shape.length]]);
	let lowestX = shape.map(([a,b]) => a).reduce((a,b)=>Math.min(a,b), 1/0) - 1;

	let p1 = [lowestX, point[1]];
	let q1 = point;

	let intersections = shapeLines.map(([p2,q2]) => doLinesIntersect(p1, q1, p2, q2) ? 1 : 0)
		.reduce((a,b)=> a+b, 0);

	return intersections % 2 == 1;
}
