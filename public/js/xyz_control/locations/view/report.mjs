export default _xyz => entry => {

  let template = entry.report ? (entry.report.template ? entry.report.template : 'map') : 'map'; 

  entry.row.classList.add('tr_report');

  entry.row.appendChild(
    _xyz.utils.hyperHTML.wire()`
    <td style="padding: 10px 0;" colSpan=2>
      <a
        style="color: #090;cursor:pointer;"
        >Site Report`
  );

  entry.row.addEventListener('click', () => {
    window.open(_xyz.host + '/report?layer=' + entry.location.layer  + '&id=' + entry.location.id + '&locale=' + _xyz.workspace.locale.key + '&token=' + _xyz.token + '&template=' + template + '&layers=' + _xyz.hooks.current.layers, '_blank');
  });

};