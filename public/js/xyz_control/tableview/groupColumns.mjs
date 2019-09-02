export default _xyz => table => {

	if(!Object.values(table.columns).some(col => col.group)) return table.columns;

    const _columns = {}, columns = [];

    // get group nests
    table.columns.forEach(col => {
      if(col.group && !_columns[col.group]) {
        _columns[col.group] = {};
        _columns[col.group].title = col.group;
        _columns[col.group].columns = [];
      }
      if(!col.group) _columns[col.title] = {};
    });

    // reorganize columns
    table.columns.forEach(col => col.group ? _columns[col.group].columns.push(col) : _columns[col.title] = col );

    // construct final setup
    Object.values(_columns).forEach(_col =>  columns.push(_col) );

    return columns;
}