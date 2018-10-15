import _xyz from '../../_xyz.mjs';

export default layer => {

  // Create cluster panel and add to layer dashboard.
  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Editing'
    },
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: panel,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  function someFunction(word){
    console.log(word);
  }


  _xyz.utils.createStateButton({
    text: 'polygon',
    appendTo: panel,
    fx: someFunction
  });

  _xyz.utils.createStateButton({
    text: 'rectangle',
    appendTo: panel,
    fx: someFunction
  });


  _xyz.utils.createStateButton({
    text: 'circle',
    appendTo: panel,
    fx: someFunction
  });

  _xyz.utils.createStateButton({
    text: 'catchment',
    appendTo: panel,
    fx: someFunction
  });

};