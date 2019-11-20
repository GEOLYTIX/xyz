export default _xyz => entry => {

  if(entry.label_td) {
    entry.label_td.colSpan = '2';
  } else {
    entry.row.remove();
  }

  const src = `${_xyz.host}/proxy/request?uri=https://maps.googleapis.com/maps/api/streetview?location=${entry.location.marker[1]},${entry.location.marker[0]}&size=300x230&provider=GOOGLE&token=${_xyz.token || ''}`;

  entry.location.view.node.appendChild(
    _xyz.utils.wire()`
    <tr class="${entry.class || ''}">
      <td colspan=2>
        <a
        target="_blank" 
        href="${'https://www.google.com/maps?cbll=' + entry.location.marker[1] + ',' + entry.location.marker[0] + '&layer=c'}">
          <img
          class="img_streetview"
          src="${src}">`
  );
  
};