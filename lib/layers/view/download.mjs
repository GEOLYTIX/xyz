export default _xyz => {

	const download = {

    panel: panel

  }

  return download;

	function panel(layer) {

		if (!layer.download) return

		const panel = _xyz.utils.html.node`<div class="drawer panel expandable">`

	    panel.appendChild(_xyz.utils.html.node`
	    	<div
	    	class="header primary-colour"
	    	onclick=${e => {
	    		e.stopPropagation()
                _xyz.utils.toggleExpanderParent(e.target, true)
            }}>
            <span>Layer data</span>
            <button class="btn-header xyz-icon icon-expander primary-colour-filter">`)

	    panel.appendChild(_xyz.utils.html.node`
	    	<label class="input-checkbox">
	    	<input type="checkbox"
	    	onchange=${e => {
	    		layer.download.viewport = e.target.checked;
	    		e.stopPropagation();
	    	}}>
	</input>
	<div></div><span>Features in viewport only`);

	    panel.appendChild(_xyz.utils.html.node`
	    	<button
	    	class="btn-wide primary-colour"
	    	onclick=${e => {
	    		e.stopPropagation();
	    		const btn = e.target;

	    		btn.classList.add('active');
	    		setTimeout(() => {
	    			btn.classList.remove('active');
	    		}, 300);

	    		const bounds = layer.download.viewport && _xyz.map && _xyz.mapview.getBounds();

	    		let xhr = new XMLHttpRequest();   

	    		xhr.responseType = 'blob';

	    		xhr.open(
	    			'GET', _xyz.host + '/api/layer/data?' +
	    			_xyz.utils.paramString({
	    				locale: _xyz.locale.key,
	    				layer: layer.key,
	    				table: layer.tableCurrent(),
	    				filter: layer.filter && JSON.stringify(layer.filter.current),
                        viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _xyz.mapview.srid]
                }));

                xhr.onload = e => {
                	var a = document.createElement('a');
                    a.href = window.URL.createObjectURL(e.target.response);
                    a.download = `${layer.key}.json`;
                    a.dispatchEvent(new MouseEvent('click'));
                }

                xhr.send();

            }}>Download as GeoJSON`);
 

        return panel;
	}
}