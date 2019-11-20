export default _xyz => function() {

  const location = this;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/edit/delete?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: location.layer.key,
    table: location.table,
    id: location.id,
    token: _xyz.token
  }));

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    // Reload layer.
    location.layer.reload();

    location.remove();

  };

  if(confirm('Are you sure you want to delete this feature? This cannot be undone.')) xhr.send(); 

};