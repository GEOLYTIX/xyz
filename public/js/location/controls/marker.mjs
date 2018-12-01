import _xyz from '../../_xyz.mjs';

export default record => {
  
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'location_off',
      className: 'material-icons cursor noselect btn_header',
      title: 'Hide marker'
    },
    style: {
      color: record.color
    },
    appendTo: record.header,
    eventListener: {
      event: 'click',
      funct: e => {
      
        e.stopPropagation();

        if (e.target.textContent === 'location_off') {
          _xyz.map.removeLayer(record.location.Marker);
          e.target.textContent = 'location_on';
          e.target.title = 'Show marker';

        } else {
          _xyz.map.addLayer(record.location.Marker);
          e.target.textContent = 'location_off';
          e.target.title = 'Hide marker';
        }

      }
    }
  });
};