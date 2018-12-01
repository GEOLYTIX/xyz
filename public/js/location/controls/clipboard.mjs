import _xyz from '../../_xyz.mjs';

export default record => {
    
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'file_copy',
      className: 'material-icons cursor noselect btn_header',
      title: 'Copy to clipboard'
    },
    style: {
      color: record.color
    },
    appendTo: record.header,
    eventListener: {
      event: 'click',
      funct: e => {

        e.stopPropagation();

        let data = [];

        function processInfoj(entry, data) {

          let
            lbl = entry.label || '',
            val = entry.value || '',
            row = '';

          row = lbl + '\t' + val;

          data.push(row);
        }

        Object.values(record.location.infoj).forEach(entry => {
          if (entry.type === 'group') {
            data.push(entry.label);
            Object.values(entry.items).forEach(item => {
              processInfoj(item, data);
            });

          } else {
            processInfoj(entry, data);
          }
        });

        _xyz.utils.copyToClipboard(data.join('\n'));

      }
    }
  });
};