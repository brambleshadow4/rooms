
let IMG = {
	img: {},
	anim: {}
};

export function addImage(sym, filename)
{
	let div = document.getElementById('images');
	let img = document.createElement('img');
	img.src = "./img/" + filename;

	img.id = "img-" + sym;
	div.appendChild(img);
	IMG.img[sym] = img
}

export function addPassiveAnimation(sym, files, option)
{
	let div = document.getElementById('images');
	IMG.anim[sym] = [];

	for(let f of files)
	{
		let img = document.createElement('img');
		img.src = "./img/" + f;

		img.id = "img-" + sym;
		div.appendChild(img);
		IMG.anim[sym].push(img);
	}
}


export function getSprite(symbol){

	if(IMG.img[symbol])
		return IMG.img[symbol];

	if(IMG.anim[symbol])
	{
		let i = Math.floor(new Date().getTime() / 100) % IMG.anim[symbol].length;
		return IMG.anim[symbol][i];
	}

}