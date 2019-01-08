export default (_xyz, record, entry) => {

  entry.row.classList.add('tr_streetview');
  
  const streetview_td = _xyz.utils.createElement({
    tag: 'td',
    options: {
      className: 'td_streetview',
      colSpan: '2'
    },
    appendTo: entry.row
  });
  
  const streetview_link = _xyz.utils.createElement({
    tag: 'a',
    options: {
      href: 'https://www.google.com/maps?cbll=' + record.location.marker[1] + ',' + record.location.marker[0] + '&layer=c',
      target: '_blank'
    },
    appendTo: streetview_td
  });

  const width = _xyz.locations.container.clientWidth;
 
  // Create StreetView image and append into link element.
  _xyz.utils.createElement({
    tag: 'img',
    options: {
      className: 'img_streetview',
      src: _xyz.host + '/proxy/request?uri=https://maps.googleapis.com/maps/api/streetview?location=' + record.location.marker[1] + ',' + record.location.marker[0] + '&size=' + width + 'x230&provider=GOOGLE&token=' + _xyz.token
    },
    appendTo: streetview_link
  });
  
  record.table.appendChild(entry.row);
};