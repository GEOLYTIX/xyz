import add_document from './add_document.mjs';

import upload_document from './upload_document.mjs';

import delete_document from './delete_document.mjs';

export default _xyz => entry => {

	entry.ctrl = {
		add_document: add_document(_xyz),

		upload_document: upload_document(_xyz),

		delete_document: delete_document(_xyz)
	}

	console.log(entry);

	const docs = entry.value ? entry.value.reverse() : [];

	if (!docs.length && !entry.edit) return entry.row.remove();

	if (entry.label_td) {
		entry.label_td.colSpan = '2';
	} else {
		entry.row.remove();
	}

	const documentControl = {};

	let _tr = _xyz.utils.createElement({
		tag: 'tr',
		options: {
			colsSpan: '2'
		},
		appendTo: entry.location.view.node
	});

	let _td = _xyz.utils.createElement({
		tag: 'td',
		options: {
			colSpan: "2"
		},
		appendTo: _tr
	});

	// Create a container for document control.
	documentControl.container = _xyz.utils.createElement({
		tag: 'div',
		options: {
			className: 'doc-container'
		},
		appendTo: _td
	});

	if (entry.edit) entry.ctrl.add_document({
		documentControl: documentControl,
		entry: entry
	});

	// Add docs if any
	for(let doc of docs){

		let docCell = _xyz.utils.createElement({
			tag: 'div',
			appendTo: documentControl.container
		});

		let _doc = _xyz.utils.createElement({
		    tag: 'a', // what tag?
	        options: {
	   		    id: doc.replace(/.*\//, '').replace(/\.([\w-]{3})/, ''),
	   		    href: doc,
	   		    textContent: decodeURIComponent(decodeURIComponent(doc.split('/').pop())),
	   		    target: '_blank'
	   		},
	   		appendTo: docCell
	   	});

	   	// Add delete button if doc entry is editable.
	   	if (entry.edit) _xyz.utils.createElement({
	   		tag: 'span',
	   		options: {
	   			title: 'Delete document',
	   			className: 'btn_del',
	   			innerHTML: '<i class="material-icons">clear</i>'
	   		},
	   		style: {
	   			cursor: 'pointer'
	   		},
	   		appendTo: docCell,
	   		eventListener: {
	   			event: 'click',
	   			funct: e => {
	   				e.target.remove();

	   				entry.ctrl.delete_document({
	   					entry: entry,
	   					doc_id: _doc
	   				});
	   			}
	   		}
	   	});
	}

}