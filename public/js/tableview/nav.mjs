import _xyz from '../_xyz.mjs';

export default () => {
    
  let options = {
      start : 0
    },
    el;

  let tabs  = document.querySelectorAll('.tableview .tabs nav ul li'),
    items = document.querySelectorAll('.tableview .tabs .content-wrap section'),
    current = -1;
        
  function nav_tabs(_el, _options){
    el = _el;
    options = extend({}, options);
    extend(options, _options);
    show();
    initEvents();
  }

  function show(idx) {
    if(current >= 0){
      tabs[current].className = items[current].className = '';
    }
    // change current
    current = idx != undefined ? idx : options.start >= 0 && options.start < items.length ? options.start : 0;
    tabs[current].className = 'tab-current';
    items[current].className = 'content-current';
  }

  function initEvents(){
    tabs.forEach(function(tab, idx){
      tab.addEventListener('click', function(e){
        e.preventDefault();
        show(idx);
      });
    });
  }

  return nav_tabs();
};


function extend(a, b) {

  if(b) Object.keys(b).map(key => {
    if(b.hasOwnProperty(key)) a[key] = b[key];
  });
    
  return a;
} 





