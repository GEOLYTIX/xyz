export default _xyz => entry => {

  if (!entry.value) return;

  let div = _xyz.utils.wire()`
   <div 
    style="grid-column: 1 / 3;
    width: 100%;
    padding: 4px;
    margin-top: 2px;
    color: #666;
    border-radius: 4px;
    background-color: linen;">`;

  let inner_grid = _xyz.utils.wire()`<div style="display: grid;">`;

  div.appendChild(inner_grid);

  entry.listview.appendChild(div);

  Object.entries(entry.value).forEach(a => {

    inner_grid.appendChild(_xyz.utils.wire()`<div style="grid-column: 1;">${a[0]}`);
    inner_grid.appendChild(_xyz.utils.wire()`<div style="grid-column: 2;">${a[1]}`);

  });

}