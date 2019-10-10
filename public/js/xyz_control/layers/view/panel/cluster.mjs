export default (_xyz, layer) => {

  if (layer.format !== 'cluster') return;

  if (!layer.cluster_panel) return;

  const panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(panel);

  // Table panel header.
  const header = _xyz.utils.wire()`
  <div onclick=${e => {
    e.stopPropagation();
    _xyz.utils.toggleExpanderParent({
      expandable: layer.dataview.panel,
      accordeon: true,
    });
  }}
  class="btn_text cursor noselect">Cluster`;
  
  layer.dataview.panel.appendChild(header);

  // Set timeout to debounce layer get on range input event.
  let timeout;

  // KMeans
  panel.appendChild(_xyz.utils.wire()`
  <div>
  <span>Minimum number of cluster (KMeans): </span>
  <span class="bold">${layer.cluster_kmeans}</span>
  <div class="range">
  <input
    type="range"
    min=1
    value=${parseInt(layer.cluster_kmeans * 100)}
    max=50
    step=1
    oninput=${e=>{
    layer.cluster_kmeans = parseInt(e.target.value) / 100;
    e.target.parentNode.previousElementSibling.textContent = e.target.value / 100;
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      layer.reload();
    }, 500);
  }}>`);


  // DBScan
  panel.appendChild(_xyz.utils.wire()`
  <div>
  <span>Maximum distance between locations in cluster (DBScan): </span>
  <span class="bold">${layer.cluster_dbscan}</span>
  <div class="range">
  <input
    type="range"
    min=1
    value=${parseInt(layer.cluster_dbscan * 100)}
    max=50
    step=1
    oninput=${e=>{
    layer.cluster_dbscan = parseInt(e.target.value) / 100;
    e.target.parentNode.previousElementSibling.textContent = e.target.value / 100;
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      layer.reload();
    }, 500);
  }}>`);


  //Create cluster_logscale checkbox.
  layer.cluster_logscale = layer.cluster_logscale || false;

  panel.appendChild(_xyz.utils.wire()`
  <label class="checkbox">
  <input type="checkbox"
    checked=${layer.cluster_logscale ? true : false} 
    onchange=${e => {
    layer.cluster_logscale = e.target.checked;
    layer.reload();
  }}></input><span>Log scale cluster size.`);

};