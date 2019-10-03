export default _xyz => entry => {

	if(!entry.value) return;
   
   // Create new row and append to table.
   entry.row = _xyz.utils.wire()`<tr>`;
   entry.location.view.node.appendChild(entry.row);

   let outer_td = _xyz.utils.wire()`<td colSpan=2>`;
   entry.row.appendChild(outer_td);

   let div = _xyz.utils.wire()`<div>`;
   outer_td.appendChild(div);

   let table = _xyz.utils.wire()`<table
   style="width: 100%; padding: 6px; margin-top: 2px; 
   font-size: small; color: #666; border-radius: 4px; background-color: linen;"
   >`;
   div.appendChild(table);

   Object.entries(entry.value).map(a => {

      let tr = _xyz.utils.wire()`<tr>`;
      table.appendChild(tr);

   	a.map(i => {

         let td = _xyz.utils.wire()`<td>${i}`;
         tr.appendChild(td);
   	});

   });

}