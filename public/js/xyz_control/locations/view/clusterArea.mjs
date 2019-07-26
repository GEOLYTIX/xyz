export default _xyz => entry => {

	console.log(entry);

	if(_xyz.layers.list[entry.location.layer].format !== 'cluster') return;

	console.log('hi i am a cluster area');

	//if(!entry.value) return;

	// Create new row and append to table.
	//entry.row = _xyz.utils.createElement({
	//	tag: 'tr',
	//	appendTo: entry.location.view.node
	//});

}