function generateNodes(rand, NODE_COUNT)
{
	let nodes = [];
	
	for(let i=0; i < NODE_COUNT; i++)
	{
		nodes.push({
			id: i,
			linksTo: [],
			reachableFrom: new Set(),
			reachesTo: new Set(),
			notReachableFrom: new Set()
		});
	}

	for(let node of nodes)
	{
		node.reachableFrom.add(node);
		node.reachesTo.add(node);
		node.notReachableFrom = new Set(nodes);
		node.notReachableFrom.delete(node);
	}

	let workList = nodes.slice();
	let step = 0;


	while(workList.length)
	{	
		let i = Math.floor(rand.random() * workList.length);
		let node = workList[i];

		if(node.notReachableFrom.size == 0)
		{
			workList.splice(i,1);
			continue;
		}

		step++;

		let otherNodes = [...node.notReachableFrom];

		let linkNode = otherNodes[Math.floor(rand.random() * otherNodes.length)];

		linkNode.linksTo.push(node);

		for(let n of linkNode.reachableFrom)
		{
			for(let m of node.reachesTo)
			{
				n.reachesTo.add(m);
				m.reachableFrom.add(n);
				m.notReachableFrom.delete(n);
			}
		}
	}

	


	let bestRoute = [0, 0, 1];



	for(let i=0; i<NODE_COUNT; i++)
	{
		for(let n of nodes)
		{
			delete n.weight;
		}

		nodes[i].weight = 1;

		workList = [nodes[i]]

		while(workList.length)
		{
			let node = workList.shift();

			let nextWeight = node.weight / node.linksTo.length;

			for(let n of node.linksTo)
			{
				if(n.weight == undefined || n.weight < nextWeight)
				{
					n.weight = nextWeight;
					workList.push(n);
				}
			}
		}

		let minNode = 0;
		for(let n of nodes)
		{
			if (n.weight < nodes[minNode].weight)
				minNode = n.id;
		}


		if(bestRoute[2] > nodes[minNode].weight)
		{
			bestRoute = [i, minNode, nodes[minNode].weight]
		}
	}

	for(let n of nodes)
	{
		delete n.reachableFrom;
		delete n.reachesTo;
		delete n.notReachableFrom;
	}

	return [nodes, bestRoute];
}
