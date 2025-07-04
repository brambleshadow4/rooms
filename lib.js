export function addV2(v1, v2)
{
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

export function equalV2(v1,v2)
{
	return v1[0] == v2[0] && v1[1] == v2[1]
}

export function scaleV2(v, n)
{
	return [n*v[0], n*v[1]];
}