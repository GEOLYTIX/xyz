export default _xyz => () => {

  _xyz.tableview.node.querySelector('.tab-content').innerHTML = '';

  return _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'table'
    },
    appendTo: _xyz.tableview.node.querySelector('.tab-content')
  });

};