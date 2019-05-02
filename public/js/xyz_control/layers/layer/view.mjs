export default _xyz => function () {

  const layer = this;

  layer.drawer = _xyz.utils.hyperHTML.wire()`
  <div class="drawer">`;

  layer.header = _xyz.utils.createElement({
    tag: 'div',
    options: {
      innerHTML: (layer.group ?
        ('&#10149; ' + layer.name) :
        (layer.name || layer.key)),
      className: 'header'
    },
    style: {
      borderBottom: '2px solid ' + (((layer.style || {}).default || {}).color ? layer.style.default.color : '#333')
    },
    appendTo: layer.drawer
  });

  layer.loader = _xyz.utils.hyperHTML.wire()`
  <div class="loader">`;

  layer.drawer.appendChild(layer.loader);

};