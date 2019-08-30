export default _xyz => {

	const contextmenu = {

		create: create,

		close: close
	}

	return contextmenu;


	function create(e, param){

		//console.log(e);

		_xyz.mapview.contextmenu = _xyz.utils.createElement({
			tag: 'div',
			options: {
				classList: 'contextmenu'
			},
			style: {
				left: `${e.layerPoint.x}px`,
				top: `${e.layerPoint.y}px`
			},
			appendTo: _xyz.mapview.node
		});

		let ul = _xyz.utils.createElement({
			tag: 'ul',
			appendTo: _xyz.mapview.contextmenu
		});

		for(let item of param.items){

			_xyz.utils.createElement({
				tag: 'li',
				options: {
					textContent: item.label
				},
				appendTo: ul,
				eventListener: {
					event: 'click',
					funct: item.onclick
				}
			});
		}
	}

	function close(){
		_xyz.mapview.node.style.cursor = '';
		_xyz.mapview.state = 'select';

		if(_xyz.mapview.contextmenu) {
    		_xyz.mapview.contextmenu.remove();
    		_xyz.mapview.contextmenu = null;
    	}
	}



}