export function setStrokeWeight(param){

	if(!param.style) return;

	let weight;

	switch(parseInt(param.style.weight)){

		case 1: weight = 'thin'; break;
		case 2: weight = 'medium'; break;
		case parseInt(param.style.weight) > 2: weight = 'thick'; break;

	}

	return weight;
}