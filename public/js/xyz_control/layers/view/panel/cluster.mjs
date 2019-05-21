export default (_xyz, layer) => {

  if (layer.format !== 'cluster') return;

  if (!layer.cluster_panel) return;

  // Create cluster panel and add to layer dashboard.
  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.view.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Cluster'
    },
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: panel,
          accordeon: true,
          scrolly: _xyz.desktop && _xyz.desktop.listviews,
        });
      }
    }
  });

  // Set timeout to debounce layer get on range input event.
  let timeout;

  // KMeans
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Minimum number of cluster (KMeans): '
    },
    appendTo: panel
  });

  let lblKMeans = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.cluster_kmeans,
      className: 'bold'
    },
    appendTo: panel
  });

  _xyz.utils.slider({
    min: 1,
    max: 50,
    value: parseInt(layer.cluster_kmeans * 100),
    appendTo: panel,
    oninput: e => {
      lblKMeans.innerHTML = e.target.value / 100;
      layer.cluster_kmeans = e.target.value / 100;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        layer.get();
      }, 500);
    }
  });


  // DBScan
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Maximum distance between locations in cluster (DBScan): '
    },
    appendTo: panel
  });

  let lblDBScan = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.cluster_dbscan,
      className: 'bold'
    },
    appendTo: panel
  });

  _xyz.utils.slider({
    min: 1,
    max: 50,
    value: parseInt(layer.cluster_dbscan * 100),
    appendTo: panel,
    oninput: e => {
      lblDBScan.innerHTML = e.target.value / 100;
      layer.cluster_dbscan = e.target.value / 100;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        layer.get();
      }, 500);
    }
  });


  // markerMin
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Marker Min: '
    },
    appendTo: panel
  });

  let lblMarkerMin = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.style.markerMin,
      className: 'bold'
    },
    appendTo: panel
  });

  _xyz.utils.slider({
    min: parseInt(layer.style.markerMin * 0.3),
    max: parseInt(layer.style.markerMin * 3),
    value: parseInt(layer.style.markerMin),
    appendTo: panel,
    oninput: e => {
      lblMarkerMin.innerHTML = e.target.value;
      layer.style.markerMin = parseInt(e.target.value);
      layer.get();
    }
  });


  // markerMax
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Marker Max: '
    },
    appendTo: panel
  });

  let lblMarkerMax = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.style.markerMax,
      className: 'bold'
    },
    appendTo: panel
  });

  _xyz.utils.slider({
    min: parseInt(layer.style.markerMax * 0.3),
    max: parseInt(layer.style.markerMax * 3),
    value: parseInt(layer.style.markerMax),
    appendTo: panel,
    oninput: e => {
      lblMarkerMax.innerHTML = e.target.value;
      layer.style.markerMax = parseInt(e.target.value);
      layer.get();
    }
  });


  //Create cluster_logscale checkbox.
  layer.cluster_logscale = layer.cluster_logscale || false;
  _xyz.utils.createCheckbox({
    label: 'Log scale cluster size.',
    appendTo: panel,
    onChange: e => {

      // Set the tin construction flag to the checked status.
      layer.cluster_logscale = e.target.checked;
      layer.get();
    }
  });
};