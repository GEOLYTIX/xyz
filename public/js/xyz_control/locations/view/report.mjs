export default _xyz => entry => {

  entry.row.classList.add('tr_report');

  entry.row.appendChild(
    _xyz.utils.hyperHTML.wire()`
    <td style="padding: 10px 0;" colSpan=2>
      <a
        style="color: #090;"
        target="_blank"
        href="${_xyz.host + '/report?layer=' + entry.location.layer + '&id=' + entry.location.id + '&token=' + _xyz.token}"
        >Site Report`
  );

};