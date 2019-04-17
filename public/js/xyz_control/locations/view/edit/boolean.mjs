export default _xyz => entry => {

	const boolean_checkbox = _xyz.utils.createCheckbox({
		label: entry.name || 'True',
		appendTo: entry.val,
		checked: !!entry.value,
		onChange: e => entry.location.view.valChange({input: e.target, entry: entry, value: e.target.checked})
	});
}