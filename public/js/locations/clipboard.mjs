export default _xyz => function() {

  const location = this;

  let data = [];

  function processInfoj(entry, data) {

    let
      lbl = entry.label || '',
      val = entry.value || '',
      row = '';

    row = lbl + '\t' + val;

    data.push(row);
  }

  Object.values(location.infoj).forEach(entry => {
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

};