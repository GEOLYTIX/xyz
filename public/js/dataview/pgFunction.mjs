export default _xyz => param => {

  if (!param.entry || !param.entry.location) return;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/pgfunction?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: param.entry.location.layer.key,
    id: param.entry.location.id,
    pgFunction: param.entry.pgFunction,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onprogress = e => {
    // put a spinner here or something?
  }

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    param.entry.fields = e.target.response;
  
    if(param.entry.chart){

      let chartElem = _xyz.dataview.charts.create(param.entry);

      if(!chartElem || !chartElem.style) return;

      param.container.appendChild(chartElem);
    
    } else {

      console.log("Content not displayed in DOM");
      console.log(param.entry);
    }
  
  }

  xhr.send();

}
