export default _xyz => entry => {

	if(!entry.value) return;

	entry.value = typeof(entry.value) === 'object' ? entry.value : JSON.parse(entry.value);

	let div = _xyz.utils.wire()`
	<div 
	style="grid-column: 1 / 3;
    width: 100%;
    padding: 4px;
    margin-top: 2px;
    color: #666;
    border-radius: 4px;
    background-color: linen;
    max-height: 200px;
    overflow-y: scroll;
    font-size: small;
    ">`;

    let span = _xyz.utils.wire()`<span style="display: none; font-size: smaller; color: red;">Invalid JSON.`;

    let content = JSON.stringify(entry.value, null, 2);

    let inner_div = entry.edit ? _xyz.utils.wire()`<pre><code><textarea 
    style="background-color:linen; color: rgb(102, 102, 102); font-size: small;"
    rows=10
    oninput=${e => {

    	entry._valid = (() => {
    		if(!e.target.value) return true;
    		try {
    			JSON.parse(e.target.value);
    			return true
    		} catch (e) {
    			return false 
    		}})();

    	entry._valid ? span.style.display = 'none' : span.style.display = 'block';

    }}
    onkeyup=${e => {

    	if(!entry._valid) return;
        
    	entry.location.view.dispatchEvent(
    		new CustomEvent('valChange', {
    			detail: {
    				input: e.target,
    				entry: entry
    			}
    		}));


    }}>${content}` : _xyz.utils.wire()`<pre><code>${content}`;

    div.appendChild(inner_div);

    if(entry.edit) div.appendChild(span);

    entry.listview.appendChild(div);

}