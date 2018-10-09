import _xyz from '../../_xyz.mjs';

export default (layer, panel) => {

  // Create panel block.
  let block = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'section expandable'
    },
    appendTo: panel
  });

  // Create block title expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Cluster'
    },
    appendTo: block,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: block,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Set cluster defaults
  if (!layer.cluster_kmeans) layer.cluster_kmeans = 0.05;
  if (!layer.cluster_dbscan) layer.cluster_dbscan = 0.01;
  if (!layer.style.markerMin) layer.style.markerMin = 20;
  if (!layer.style.markerMax) layer.style.markerMax = 40;


  // KMeans
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Minimum number of cluster (KMeans): '
    },
    appendTo: block
  });

  let lblKMeans = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.cluster_kmeans,
      className: 'bold'
    },
    appendTo: block
  });

  let rKMeans = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: block
  });

  let timeout;

  _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: 1,
      value: parseInt(layer.cluster_kmeans * 100),
      max: 50,
      step: 1
    },
    appendTo: rKMeans,
    eventListener: {
      event: 'input',
      funct: e => {
        lblKMeans.innerHTML = e.target.value / 100;
        layer.cluster_kmeans = e.target.value / 100;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          timeout = null;
          layer.getLayer(layer);
        }, 500);
      }
    }
  });


  // DBScan
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Maximum distance between locations in cluster (DBScan): '
    },
    appendTo: block
  });

  let lblDBScan = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.cluster_dbscan,
      className: 'bold'
    },
    appendTo: block
  });

  let rDBScan = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: block
  });

  _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: 1,
      value: parseInt(layer.cluster_dbscan * 100),
      max: 50,
      step: 1
    },
    appendTo: rDBScan,
    eventListener: {
      event: 'input',
      funct: e => {
        lblDBScan.innerHTML = e.target.value / 100;
        layer.cluster_dbscan = e.target.value / 100;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          timeout = null;
          layer.getLayer(layer);
        }, 500);
      }
    }
  });


  // markerMin
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Marker Min: '
    },
    appendTo: block
  });

  let lblMarkerMin = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.style.markerMin,
      className: 'bold'
    },
    appendTo: block
  });

  let rMarkerMin = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: block
  });

  _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: parseInt(layer.style.markerMin * 0.3),
      value: parseInt(layer.style.markerMin),
      max: parseInt(layer.style.markerMin * 3)
    },
    appendTo: rMarkerMin,
    eventListener: {
      event: 'input',
      funct: e => {
        lblMarkerMin.innerHTML = e.target.value;
        layer.style.markerMin = parseInt(e.target.value);
        layer.getLayer(layer);
      }
    }
  });


  // markerMax
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: 'Marker Max: '
    },
    appendTo: block
  });

  let lblMarkerMax = _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: layer.style.markerMax,
      className: 'bold'
    },
    appendTo: block
  });

  let rMarkerMax = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: block
  });

  _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: parseInt(layer.style.markerMax * 0.3),
      value: parseInt(layer.style.markerMax),
      max: parseInt(layer.style.markerMax * 3)
    },
    appendTo: rMarkerMax,
    eventListener: {
      event: 'input',
      funct: e => {
        lblMarkerMax.innerHTML = e.target.value;
        layer.style.markerMax = parseInt(e.target.value);
        layer.getLayer(layer);
      }
    }
  });

  //Create cluster_logscale checkbox.
  layer.cluster_logscale = layer.cluster_logscale || false;
  _xyz.utils.checkbox({
    label: 'Log scale cluster size.',
    appendTo: block,
    onChange: e => {

      // Set the tin construction flag to the checked status.
      layer.cluster_logscale = e.target.checked;
      layer.getLayer(layer);
    }
  });

  // Add symbol to layer header.
  if (layer.style.marker) {
    _xyz.utils.createElement({
      tag: 'img',
      options: {
        src: _xyz.utils.svg_symbols(layer.style.marker),
        width: 20,
        height: 20
      },
      style: {
        float: 'right'
      },
      appendTo: layer.header
    });
  }

};