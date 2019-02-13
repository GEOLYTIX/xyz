export default (_xyz, record, entry) => {

  console.log(record);
  console.log(entry);


	  _xyz.tableview.locationTable({
	  	target: _xyz.tableview.node.querySelector('.table'),
	  	record: record,
	  	table: entry
	  });

  //console.log(entry);
};