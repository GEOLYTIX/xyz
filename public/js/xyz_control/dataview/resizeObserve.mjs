export default _xyz => () => {

  if (typeof ResizeObserver !== 'function') return;

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
			
      let width = entry.target.clientWidth;

      // observe width thresholds
      if(width >= 500) {
        _xyz.dataview.max_tabs = 6;
        unfoldElements();
      }
      if(width > 450 && width < 500){
            	_xyz.dataview.max_tabs = 5;
            	foldElements();
            	unfoldElements();
      }
      if(width > 400 && width <= 450){
            	_xyz.dataview.max_tabs = 4;
            	foldElements();
            	unfoldElements();
      }
      if(width > 300 && width <= 400){
            	_xyz.dataview.max_tabs = 3;
            	foldElements();
            	unfoldElements();
      }
      if(width > 200 && width <= 300){
            	_xyz.dataview.max_tabs = 2;
            	foldElements();
            	unfoldElements();
      }
      if(width <= 200){
            	_xyz.dataview.max_tabs = 1;
            	foldElements();
            	unfoldElements();
      }
    }
  });

  var observe = () => {
    resizeObserver.observe(_xyz.dataview.nav_bar);
  };

  var timeout;

  window.onresize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(observe, 100);
    resizeObserver.unobserve(_xyz.dataview.nav_bar);
  };
   
  // fold elements into the dropdown as width decreases
  function foldElements(){
    Object.values(_xyz.dataview.nav_bar.children).map(val => {
      let idx = Array.from(_xyz.dataview.nav_bar.children).indexOf(val);
      if(idx >= _xyz.dataview.max_tabs) {
        _xyz.dataview.nav_dropdown.insertBefore(val, _xyz.dataview.nav_dropdown.childNodes[0]);
      } 
    });
    activateTab();
  }

  // unfold elements as width grows
  function unfoldElements(){
    if(!_xyz.dataview.nav_dropdown.children.length) return;
    if(_xyz.dataview.nav_bar.children.length < _xyz.dataview.max_tabs){
      let d = _xyz.dataview.max_tabs - _xyz.dataview.nav_bar.children.length;
      for(let i = 0; i < d; i++){
        if(_xyz.dataview.nav_dropdown.children[i]) {
          _xyz.dataview.nav_dropdown.children[i].classList.remove('folded');
          _xyz.dataview.nav_bar.appendChild(_xyz.dataview.nav_dropdown.children[i]);
        }
      }
      activateTab();
    }
  }

  // activate first tab as others are folded
  function activateTab(){
    Object
      .values(_xyz.dataview.nav_bar.children)
      .forEach(tab => tab.classList.remove('tab-current'));
          
    // activate last tab
    /*_xyz.dataview.nav_bar.lastChild.classList.add('tab-current');
        _xyz.dataview.tables[_xyz.dataview.max_tabs-1].activate();*/
    // activate first tab
    if(_xyz.dataview.nav_bar && _xyz.dataview.nav_bar.firstChild) {
      _xyz.dataview.nav_bar.firstChild.classList.add('tab-current');
      _xyz.dataview.tables[0].activate();
    }
  }
};