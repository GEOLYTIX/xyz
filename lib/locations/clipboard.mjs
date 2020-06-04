export default _xyz => function() {

  const location = this;

  let data = [];

  function processInfoj(entry, data) {

    let
      lbl = entry.title || '',
      val = entry.value || '',
      row = '';

    row = lbl + '\t' + val;

    data.push(row);
  }

  Object.values(location.infoj).forEach(entry => processInfoj(entry, data));

  _xyz.utils.copyToClipboard(data.join('\n'));

};