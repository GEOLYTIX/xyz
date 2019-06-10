export default _xyz => function(term, params = {}){

  const gazetteer = this;

  // Abort the current search.
  if (gazetteer.xhr) gazetteer.xhr.abort();

  // Show loader while waiting for results from XHR.
  if(gazetteer.loader) gazetteer.loader.style.display = 'block';

  // Empty results.
  if(gazetteer.result) gazetteer.result.innerHTML = '';

  // Create abortable xhr.
  gazetteer.xhr = new XMLHttpRequest();

  // Send gazetteer query to backend.
  gazetteer.xhr.open('GET',
    _xyz.host +
    '/api/gazetteer/autocomplete?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      q: encodeURIComponent(term),
      source: params.source,
      token: _xyz.token
    }));

  gazetteer.xhr.setRequestHeader('Content-Type', 'application/json');

  gazetteer.xhr.responseType = 'json';

  gazetteer.xhr.onload = e => {

    // Hide loader.
    if(gazetteer.loader) gazetteer.loader.style.display = 'none';

    if (e.target.status !== 200) return;
      
    // Parse the response as JSON and check for results length.
    const json = e.target.response;

    if (params.callback) return params.callback(json);

    // No results
    if (json.length === 0) {
      gazetteer.result.appendChild(_xyz.utils.wire()`
      <li style="padding: 5px 0;">No results for this search.</li>`);
      return;
    }

    // Add results from JSON to gazetteer.
    Object.values(json).forEach(entry => {
      const li = _xyz.utils.wire()`<li>${entry.label}</li>`;
      Object.entries(entry).forEach(data => li['data-' + data[0]] = data[1]);
      gazetteer.result.appendChild(li);
    });

  };

  gazetteer.xhr.send();

};