import add_document from './add_document.mjs';

import upload_document from './upload_document.mjs';

import delete_document from './delete_document.mjs';

export default _xyz => entry => {

	entry.ctrl = {
		add_document: add_document(_xyz),

		upload_document: upload_document(_xyz),

		delete_document: delete_document(_xyz)
	}

	const docs = entry.value ? entry.value.reverse() : [];

	if (!docs.length && !entry.edit) return entry.row.remove();

	if (entry.label_td) {
		entry.label_td.colSpan = '2';
	} else {
		entry.row.remove();
	}

	const documentControl = {};

	let _tr = _xyz.utils.wire()`<tr colSpan=2>`;

	entry.location.view.node.appendChild(_tr);

	let _td = _xyz.utils.wire()`<td colSpan=2>`;

	_tr.appendChild(_td);

	// Create a container for document control.
	documentControl.container = _xyz.utils.wire()`<div class="doc-container">`;

	_td.appendChild(documentControl.container);

	if (entry.edit) entry.ctrl.add_document({
		documentControl: documentControl,
		entry: entry
	});

	// Add docs if any
	for(let doc of docs){

		let docCell = _xyz.utils.wire()`<div>`;

		documentControl.container.appendChild(docCell);

	   	let _doc = _xyz.utils.wire()`
	   	<a href=${doc} target="_blank"
	   	>${decodeURIComponent(decodeURIComponent(doc.split('/').pop()))}`;

	   	docCell.appendChild(_doc);

	   	_doc.dataset.name = doc.replace(/^.*[\\\/]/, '');

	   	// Add delete button if doc entry is editable.
	   	if(entry.edit) docCell.appendChild(_xyz.utils.wire()`
	   		<span class="btn_del"
	   		title="Delete document"
	   		style="cursor: pointer;"
	   		onclick=${
	   			e => {
	   				e.target.remove();

	   				entry.ctrl.delete_document({
	   					entry: entry,
	   					doc: _doc
	   				});
	   			}
	   		}
	   		><i class="material-icons">clear`);
	}

}