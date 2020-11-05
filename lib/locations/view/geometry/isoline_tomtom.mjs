export default _xyz => {

	return {

		create: create,
		settings: settings
	}

	function settings(entry){

		if (entry.edit.isoline_tomtom && !entry.edit.isoline_tomtom.geometry && (entry.edit.isoline_tomtom.timeBudgetInSec || (!entry.edit.isoline_tomtom.timeBudgetInSec && entry.value))) return _xyz.utils.html.node`<div>`;

		if (entry.edit.isoline_tomtom && entry.edit.isoline_tomtom.geometry && entry.edit.isoline_tomtom.minutes && !entry.value) return _xyz.utils.html.node`<div>`;

		panel(entry);

		if (entry.edit.isoline_tomtom && entry.edit.isoline_tomtom.geometry && (entry.edit.isoline_tomtom.timeBudgetInSec || (!entry.edit.isoline_tomtom.timeBudgetInSec && entry.value))) {
			edit(entry);
			return entry.edit.panel;
		}

		if(entry.edit.isoline_tomtom.timeBudgetInSec === undefined) {

        	entry.edit.panel.appendChild(_xyz.utils.html.node `
        	<div style="margin-top: 12px; grid-column: 1 / 3;">
        	<span>Time budget in minutes: </span>
        	<span class="bold">${entry.edit.isoline_tomtom.timeBudgetInSec || 10}</span>
        	<div class="input-range">
        	<input class="secondary-colour-bg"
        	type="range"
            min=5
            value=10
            max=60
            step=1
            oninput=${e=>{
            	entry.edit.isoline_tomtom.timeBudgetInSec = 60*parseInt(e.target.value);
            	e.target.parentNode.previousElementSibling.textContent = e.target.value;
            }}>`);
        }

		const modes = [
		{ car: 'car' },
		{ truck: 'truck' },
		{ taxi: 'taxi' },
		{ bus: 'bus' },
		{ van: 'van' },
		{ motorcycle: 'motorcycle'},
		{ bicycle: 'bicycle'},
		{ pedestrian: 'pedestrian'}];

		const routeTypes = [
		{fastest: 'fastest'},
		{shortest: 'shortest'},
		{eco: 'eco'},
		{thrilling: 'thrilling'}];

		if(entry.edit.isoline_tomtom.travelMode === undefined) entry.edit.panel.appendChild(makeDropdown({
			title: 'Travel mode',
			options: modes,
			callback: e => {
				entry.edit.isoline_tomtom.travelMode = e.target.value;
			}
		}));

		if(entry.edit.isoline_tomtom.routeType === undefined) entry.edit.panel.appendChild(makeDropdown({
			title: 'Route type', 
			options: routeTypes, 
			callback: e => {
        	entry.edit.isoline_tomtom.routeType = e.target.value;
        }}));

        if(entry.edit.isoline_tomtom.vehicleMaxSpeed === undefined) entry.edit.panel.appendChild(_xyz.utils.html.node `
        <div style="padding-top: 5px; grid-column: 1 / 3">
        <div style="display: grid; grid-template-columns: 150px 1fr; align-items: center;">
        <div style="grid-column: 1;"><span>Max Vehicle Speed </span></div>
        <div style="grid-column: 2;"><input type="number" value="${entry.value || entry.displayValue || ''}"
        placeholder="km/h"
        onkeyup=${e => {
        	entry.edit.isoline_tomtom.vehicleMaxSpeed = parseInt(e.target.value)
        }}>`);

        if(entry.edit.isoline_tomtom.traffic === undefined) entry.edit.panel.appendChild(_xyz.utils.html.node `
        <div style="padding-top: 5px; grid-column: 1 / 3">
        <label class="input-checkbox">
        <input type="checkbox"
          .checked=${!!entry.value}
          onchange=${e => {
          	entry.edit.isoline_tomtom.traffic = e.target.checked
          }}>
        </input>
        <div></div><span>Include current traffic`);

        return entry.edit.panel;

	}

	function create(entry){

		if(!entry.edit.isoline_tomtom.timeBudgetInSec) entry.edit.isoline_tomtom.timeBudgetInSec = 60*10
		if(!entry.edit.isoline_tomtom.routeType) entry.edit.isoline_tomtom.routeType = 'fastest'
		if(!entry.edit.isoline_tomtom.travelMode) entry.edit.isoline_tomtom.travelMode = 'car'

		const origin = `${entry.location.geometry.coordinates[1]},${entry.location.geometry.coordinates[0]}` 

    	const xhr = new XMLHttpRequest();

    	xhr.open('GET', _xyz.host + '/api/provider/tomtom?url=' +
    		`api.tomtom.com/routing/1/calculateReachableRange/${origin}/json&settings=` +
    	    JSON.stringify(entry.edit.isoline_tomtom));

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';

        xhr.onload = e => {

        	if (e.target.status !== 200 || !e.target.response.reachableRange) {
        		entry.location.view && entry.location.view.classList.remove('disabled');
        		console.log(e.target.response);
        		return alert('Wrong');
        	}

        	entry.newValue = {
        		'type': 'Polygon',
        		'coordinates': [e.target.response.reachableRange.boundary.map(coord => {return [coord.longitude, coord.latitude]})]
        	};

        	if(entry.edit.meta) {

        		let date = new Date();

        		entry.location.infoj
        		.filter(_entry => _entry.type === 'json' && _entry.field === entry.edit.meta)
        		.forEach(meta => meta.newValue = Object.assign({
        			"Recent range": "TomTom",
        			"Created": `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes() > 8 ? date.getMinutes()+1 : `0${date.getMinutes()+1}`}`
        		}, entry.edit.isoline_tomtom));
        	}

        	if(entry.edit.panel){
        		entry.edit.panel.remove();
        		entry.edit.panel = null;
        		panel(entry);
        	}

        	entry.location.update();
        }

        xhr.send();

        entry.location.view && entry.location.view.classList.add('disabled');
	}


	function panel(entry){

		if(entry.edit.panel) return;

		entry.edit.panel = _xyz.utils.html.node`
		<div
		class="${`drawer group panel expandable ${entry.class || ''}`}"
		style="display: grid; grid-column: 1 / 3;">
		<div
		class="header primary-colour"
		style="text-align: left; grid-column: 1 / 3;"
        onclick=${e => {
          _xyz.utils.toggleExpanderParent(e.target);
        }}
        ><span>TomTom Settings</span>
        <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;
    }

    function edit(entry){

    	panel(entry);

    	if(entry.edit.edit) return;

    	entry.edit.edit = _xyz.utils.html.node`
    	<div style="
    	margin-top: 8px;
        grid-column: 1 / 3;
        display: grid;
        grid-template-columns: 50px 1fr;
        align-items: center;
        ">
        <div style="grid-column: 1 / span 3;">
        <button class="btn-wide primary-colour" style="font-size: x-small;"
        onclick=${e => {

        	e.stopPropagation();
        	const btn = e.target;

        	if (btn.classList.contains('active')) {
        		btn.classList.remove('active');
                _xyz.mapview.interaction.edit.finish();
                return _xyz.map.removeLayer(entry.edit.feature);
            }

            btn.classList.add('active');

            entry.edit.feature = _xyz.mapview.geoJSON({ 
            	geometry: typeof entry.value  === 'object' ? entry.value : JSON.parse(entry.value), 
            	dataProjection: '4326'
            });

            _xyz.mapview.interaction.edit.begin({
            	location: entry.location,
            	type: 'Polygon',
                source: new ol.source.Vector({
                    features: [entry.edit.feature.getSource().getFeatures()[0].clone()]
                }),
                callback: () => {
                    btn.classList.remove('active');
                    _xyz.map.removeLayer(entry.edit.feature);
                },
                update: () => update(entry)
            });

        }}>Edit`;

        entry.edit.panel.appendChild(entry.edit.edit);
    }

    function update(entry){

    	const features = _xyz.mapview.interaction.edit.Source.getFeatures();
    	const geoJSON = new ol.format.GeoJSON();

    	entry.newValue = JSON.parse(
    		geoJSON.writeFeature(
    			features[0],
    			{ 
    				dataProjection: 'EPSG:' + entry.location.layer.srid,
    				featureProjection: 'EPSG:' + _xyz.mapview.srid
    			})).geometry;

    	entry.location.update();
    	_xyz.map.removeLayer(entry.edit.feature);
    	_xyz.mapview.interaction.edit.finish();
    }

    function makeDropdown(params) {

    	return _xyz.utils.html.node `<div style="margin-top: 8px; grid-column: 1 / 3; align-items: center;">
            <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
          	<div style="grid-column: 1;">${params.title}</div>
          	<div style="grid-column: 2;">
          	<button class="btn-drop">
          	<div
                class="head"
                onclick=${e => {
                    e.preventDefault();
                    e.target.parentElement.classList.toggle('active');
                }}>
                <span>${Object.keys(params.options[0])}</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${params.options.map(
                keyVal => _xyz.utils.html.node`
                <li onclick=${e=>{
                    const drop = e.target.closest('.btn-drop');
                    drop.classList.toggle('active');
                    drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];

                    if(params.callback) params.callback(e);
                
                }}>${Object.keys(keyVal)[0]}`)}`;
    }

}