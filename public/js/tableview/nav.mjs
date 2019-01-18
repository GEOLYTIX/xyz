export default _xyz => {

  let
    options = { start: 0 },
    tabs = document.querySelectorAll('.tableview .tabs nav ul li'),
    items = document.querySelectorAll('.tableview .tabs .content-wrap section'),
    current = -1,
    tab_layers = [];

  Object.values(_xyz.layers.list).map(layer => {
    if (layer.tab) tab_layers.push(layer);
  });

  function nav_tabs(_options) {

    options = extend({}, options);

    extend(options, _options);

    show();

    initEvents();

  }

  function show(idx) {

    if (current >= 0) {
      tabs[current].className = items[current].className = '';
    }

    current = idx != undefined ? idx : options.start >= 0 && options.start < items.length ? options.start : 0;

    tabs[current].className = 'tab-current';

    items[current].className = 'content-current';

    if (!tab_layers[current].tableview.container.childNodes.length) tab_layers[current].tableview.container = _xyz.tableview.content(tab_layers[current]);

    document.querySelector('.tableview .tabs li:last-child div').style.transform = 'translate3d(-' + (tabs.length - current - 1) + '00%, 0, 0)';

    _xyz.tableview.observe();

  }

  function initEvents() {

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        show(idx);
        //_xyz.tableview.observe();
        //if(_xyz.tableview.observe) _xyz.tableview.observe();
      });
    });
  }

  function extend(a, b) {

    if (b) Object.keys(b).map(key => {
      if (b.hasOwnProperty(key)) a[key] = b[key];
    });
  
    return a;
  }

  return nav_tabs();
};