export default (_xyz, record) => {
    
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

        record.location.flyTo();

      }
    }
  });
  
};