export default _xyz => param => {

	const xhr = new XMLHttpRequest();

	xhr.open('GET', _xyz.host + '/api/location/edit/documents/delete?' + _xyz.utils.paramString({
		locale: _xyz.workspace.locale.key,
		layer: param.entry.location.layer.key,
		table: param.entry.location.table,
		field: param.entry.field,
		id: param.entry.location.id,
		doc_id: param.doc.dataset.name,
		doc_src: encodeURIComponent(param.doc.href),
		token: _xyz.token
	}));

	xhr.onload = e => {

		if (e.target.status !== 200) return;
		document.querySelector(`[data-name="${param.doc.dataset.name}"]`).parentNode.remove();
	};

	xhr.send();
}