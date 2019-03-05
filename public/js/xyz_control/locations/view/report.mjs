export default _xyz => entry => {

  entry.row.classList.add('tr_report');

  entry.row.appendChild(
    _xyz.utils.hyperHTML.wire()`
      <td style="padding-top: 10px;" colSpan=2>
        <a
          style="color: #090;"
          target="_blank"
          href="${_xyz.host + '/report?id=' + entry.location.id}"
          >Site Report
        </a>
      </td>`);

};