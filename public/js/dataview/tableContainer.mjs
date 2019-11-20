export default _xyz => show_toolbars => {

  if(_xyz.dataview.node) _xyz.dataview.node.querySelector('.tab-content').innerHTML = '';

  if(show_toolbars){

    let toolbar = _xyz.utils.wire()`
      <div style="margin-right: 10px; margin-top: 10px; text-align: right;">`;

    _xyz.dataview.node.querySelector('.tab-content').appendChild(toolbar);


    toolbar.appendChild(_xyz.utils.wire()`
      <div class="primary-colour" title="Download as CSV"
      style="cursor: pointer; display: inline-block; margin-right: 6px;"
      onclick=${() => {
        _xyz.dataview.current_table.Tabulator.download('csv', `${_xyz.dataview.current_table.title}.csv`);
      }}
      >CSV
    `);

    toolbar.appendChild(_xyz.utils.wire()`
      <div class="primary-colour" title="Download as JSON"
      style="cursor: pointer; display: inline-block; margin-right: 6px;"
      onclick=${() => {
        _xyz.dataview.current_table.Tabulator.download('json', `${_xyz.dataview.current_table.title}.json`);
      }}
      >JSON
    `);

  	}

  let _content = _xyz.utils.wire()`<div class="table">`;
  
  _xyz.dataview.node.querySelector('.tab-content').appendChild(_content);

  return _content;

};