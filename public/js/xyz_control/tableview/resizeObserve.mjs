export default _xyz => () => {

	if (typeof ResizeObserver !== 'function') return;

	const resizeObserver = new ResizeObserver(entries => {
		for (let entry of entries) {
			
			let width = entry.target.clientWidth;

			// observe width thresholds
			if(width >= 500) {
				_xyz.tableview.max_tabs = 6;
				unfoldElements();
			}
            if(width > 450 && width < 500){
            	_xyz.tableview.max_tabs = 5;
            	foldElements();
            	unfoldElements();
            }
            if(width > 400 && width <= 450){
            	_xyz.tableview.max_tabs = 4;
            	foldElements();
            	unfoldElements();
            }
            if(width > 300 && width <= 400){
            	_xyz.tableview.max_tabs = 3;
            	foldElements();
            	unfoldElements();
            }
            if(width > 200 && width <= 300){
            	_xyz.tableview.max_tabs = 2;
            	foldElements();
            	unfoldElements();
            }
            if(width <= 200){
            	_xyz.tableview.max_tabs = 1;
            	foldElements();
            	unfoldElements();
            }
		}
	});

	var observe = () => {
		resizeObserver.observe(_xyz.tableview.nav_bar);
	};

	var timeout;

	window.onresize = () => {
		clearTimeout(timeout);
		timeout = setTimeout(observe, 100);
		resizeObserver.unobserve(_xyz.tableview.nav_bar);
	}
   
   // fold elements into the dropdown as width decreases
	function foldElements(){
		Object.values(_xyz.tableview.nav_bar.children).map(val => {
			let idx = Array.from(_xyz.tableview.nav_bar.children).indexOf(val);
			if(idx >= _xyz.tableview.max_tabs) {
				_xyz.tableview.nav_dropdown.insertBefore(val, _xyz.tableview.nav_dropdown.childNodes[0]);
			} 
		});
		activateTab();
	}

	// unfold elements as width grows
	function unfoldElements(){
		if(!_xyz.tableview.nav_dropdown.children.length) return;
		if(_xyz.tableview.nav_bar.children.length < _xyz.tableview.max_tabs){
			let d = _xyz.tableview.max_tabs - _xyz.tableview.nav_bar.children.length;
			for(let i = 0; i < d; i++){
				_xyz.tableview.nav_dropdown.children[i].classList.remove('folded');
				_xyz.tableview.nav_bar.appendChild(_xyz.tableview.nav_dropdown.children[i]);
			}
			activateTab();
		}
	}

	// activate first tab as others are folded
	function activateTab(){
		Object
          .values(_xyz.tableview.nav_bar.children)
          .forEach(tab => tab.classList.remove('tab-current'));
          
         // activate last tab
        /*_xyz.tableview.nav_bar.lastChild.classList.add('tab-current');
        _xyz.tableview.tables[_xyz.tableview.max_tabs-1].activate();*/
        // activate first tab
        _xyz.tableview.nav_bar.firstChild.classList.add('tab-current');
        _xyz.tableview.tables[0].activate();
    }
}