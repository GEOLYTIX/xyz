import _xyz from '../../_xyz.mjs';

export default record => {
    
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'search',
      className: 'material-icons cursor noselect btn_header',
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

        _xyz.map.flyToBounds(record.location.Layer.getBounds());

      }
    }
  });
};