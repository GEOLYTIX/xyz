import _xyz from '../../_xyz.mjs';

export default record => {
  
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect btn_header expander',
      title: 'Zoom map to feature bounds'
    },
    style: {
      color: record.color
    },
    appendTo: record.header,
    eventListener: {
      event: 'click',
      funct: e => {

        e.stopPropagation();

        _xyz.utils.toggleExpanderParent({
          expandable: record.drawer,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });

      }
    }
  });
};