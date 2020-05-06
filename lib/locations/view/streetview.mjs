export default _xyz => entry => {

  if(entry.__label_div) entry.__label_div.style.gridColumn = "1 / 3";
  
  const lnglat = _xyz.mapview.lib.proj.transform(
    entry.location.marker, 
    'EPSG:' + _xyz.mapview.srid,
    'EPSG:4326');

  const src = `${_xyz.host}/api/proxy?uri=/maps/api/streetview?location=${lnglat[1]},${lnglat[0]}%26source=outdoor%26size=300x230&provider=GOOGLE&host=maps.googleapis.com&token=${_xyz.token || ''}`;

  entry.listview.appendChild(_xyz.utils.wire()`
    <div
      class="${entry.class || ''}"
      style="grid-column: 1 / 3;">
      <a
        target="_blank"
        href="${'https://www.google.com/maps?cbll=' + lnglat[1] + ',' + lnglat[0] + '&layer=c'}">
        <img src="${src}">`);
  
};