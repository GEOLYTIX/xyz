export default _xyz => entry => {

	if(!entry.value) return;
   
   // Create new row and append to table.
   entry.row = _xyz.utils.createElement({
    tag: 'tr',
	appendTo: entry.location.view.node
   });

   let outer_td = _xyz.utils.createElement({
   	tag: 'td',
   	options: {
   		colSpan: '2'
   	},
   	appendTo: entry.row
   });

   let div = _xyz.utils.createElement({
   	tag: 'div',
   	appendTo: outer_td
   });

   let table = _xyz.utils.createElement({
   	tag: 'table',
   	style: {
   		fontSize: 'small',
   		width: '85%',
   		color: 'olive',
   		borderRadius: '4px',
   		backgroundColor: 'linen',
   		padding: '6px',
   		marginTop: '2px'
   	},
   	appendTo: div
   });

   Object.entries(entry.value).map(a => {
   	let tr = _xyz.utils.createElement({tag: 'tr', appendTo: table});

   	a.map(i => {
   		let td = _xyz.utils.createElement({
   			tag: 'td', 
   			options: {
   				textContent: i
   			},
   			appendTo: tr
   		});
   	});

   });

}