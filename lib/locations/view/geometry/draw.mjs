export default _xyz => {

	return {

		polygon: polygon,

		circle: circle,

		rectangle: rectangle,

		freehand: freehand,

		line: line,

		edit: edit
	
	}


	function panel(entry){

		if(entry.edit.panel) return;

		entry.edit.panel = _xyz.utils.wire()`
		<div
		class="drawer group panel expandable ${entry.class || ''}"
		style="display: grid; grid-column: 1 / 3; max-height: 20px;">
		<div
		class="header primary-colour"
        style="text-align: left; grid-column: 1 / 3;"
        onclick=${e => {
        	_xyz.utils.toggleExpanderParent(e.target);
        }}
        ><span>${entry.name ?  `${entry.name} editing` : 'Editing'}</span>
        <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;

        entry.edit.group = {};

        return entry.value ? edit(entry) : entry.edit.panel;
    }

    function polygon(entry){

    	if(entry.value) return edit(entry);

    	panel(entry);

        if (entry.edit.group.edit) {
        	entry.edit.group.edit.remove();
            entry.edit.group.edit = null;
        }

    	entry.edit.group.polygon = _xyz.utils.wire()`
    		<div style="
    		margin-top: 8px;
    		grid-column: 1 / 3;
    		display: grid;
    		grid-template-columns: 50px 1fr;
    		align-items: center;
    		">
    		<div style="grid-column: 1 / span 3;">
    		<button class="btn-wide primary-colour" style="font-size: x-small;"
    		onclick=${ e => {

    			e.stopPropagation();

    			const btn = e.target;

    			if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

    			btn.classList.add('active');

    			_xyz.mapview.interaction.draw.begin({
    				layer: entry.location.layer,
    				type: 'Polygon',
    				callback: () => {
    					
    					btn.classList.remove('active');
    					
    					Object.values(entry.edit.group).map(el => {
    						if(!el) return;
    						el.remove();
    						el = null;
    					});
    				
    				},
    				update: () => update(entry)
    			});
    		}}>Polygon`;

    	entry.edit.panel.appendChild(entry.edit.group.polygon);

    	return entry.edit.panel;
    }

    function circle(entry){

    	if(entry.value) return _xyz.utils.wire()`<div>`;

    	panel(entry);

    	if (entry.edit.group.edit) {
        	entry.edit.group.edit.remove();
            entry.edit.group.edit = null;
        }

    	entry.edit.group.circle = _xyz.utils.wire()`
    	<div style="
    	margin-top: 8px;
    	grid-column: 1 / 3;
    	display: grid;
    	grid-template-columns: 50px 1fr;
    	align-items: center;
    	">
    	<div style="grid-column: 1 / span 3;">
    	<button class="btn-wide primary-colour" style="font-size: x-small;"
    	onclick=${ e => {

    	    e.stopPropagation();

    		const btn = e.target;

    		if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

    		btn.classList.add('active');

    		_xyz.mapview.interaction.draw.begin({
    			layer: entry.location.layer,
    			type: 'Circle',
    			geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
    			callback: () => {

    				btn.classList.remove('active');

    				Object.values(entry.edit.group).map(el => {
    					if(!el) return;
    					el.remove();
    					el = null;
    				});
    				
    			},
    			update: () => update(entry)
    		});

    	}}>Circle`;

    	entry.edit.panel.appendChild(entry.edit.group.circle);

    	return entry.edit.panel;
    }

    function rectangle(entry){

    	if(entry.value) return edit(entry);

    	panel(entry);

    	if (entry.edit.group.edit) {
        	entry.edit.group.edit.remove();
            entry.edit.group.edit = null;
        }

    	entry.edit.group.rectangle = _xyz.utils.wire()`
    	<div style="
    	margin-top: 8px;
    	grid-column: 1 / 3;
    	display: grid;
    	grid-template-columns: 50px 1fr;
    	align-items: center;
    	">
    	<div style="grid-column: 1 / span 3;">
    	<button class="btn-wide primary-colour" style="font-size: x-small;"
    	onclick=${ e => {

    	    e.stopPropagation();

    		const btn = e.target;

    		if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

    		btn.classList.add('active');

    		_xyz.mapview.interaction.draw.begin({
    			layer: entry.location.layer,
    			type: 'Circle',
    			geometryFunction: ol.interaction.Draw.createBox(),
    			callback: () => {

    				btn.classList.remove('active');

    				Object.values(entry.edit.group).map(el => {
    					if(!el) return;
    					el.remove();
    					el = null;
    				});
    				
    			},
    			update: () => update(entry)
    		});

    	}}>Rectangle`;

    	entry.edit.panel.appendChild(entry.edit.group.rectangle);

    	return entry.edit.panel;
    }

    function freehand(entry){

    	if(entry.value) return _xyz.utils.wire()`<div>`;

    	panel(entry);

    	if (entry.edit.group.edit) {
        	entry.edit.group.edit.remove();
            entry.edit.group.edit = null;
        }

    	entry.edit.group.freehand = _xyz.utils.wire()`
    	<div style="
    	margin-top: 8px;
    	grid-column: 1 / 3;
    	display: grid;
    	grid-template-columns: 50px 1fr;
    	align-items: center;
    	">
    	<div style="grid-column: 1 / span 3;">
    	<button class="btn-wide primary-colour" style="font-size: x-small;"
    	onclick=${ e => {

    	    e.stopPropagation();

    		const btn = e.target;

    		if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

    		btn.classList.add('active');

    		_xyz.mapview.interaction.draw.begin({
    			layer: entry.location.layer,
    			type: 'LineString',
    			freehand: true,
    			callback: () => {

    				btn.classList.remove('active');

    				Object.values(entry.edit.group).map(el => {
    					if(!el) return;
    					el.remove();
    					el = null;
    				});
    				
    			},
    			update: () => update(entry)
    		});

    	}}>Freehand`;

    	entry.edit.panel.appendChild(entry.edit.group.freehand);

    	return entry.edit.panel;
    }

    function line(entry){

    	if(entry.value) return edit(entry);

    	panel(entry);

    	if (entry.edit.group.edit) {
        	entry.edit.group.edit.remove();
            entry.edit.group.edit = null;
        }

    	entry.edit.group.line = _xyz.utils.wire()`
    	<div style="
    	margin-top: 8px;
    	grid-column: 1 / 3;
    	display: grid;
    	grid-template-columns: 50px 1fr;
    	align-items: center;
    	">
    	<div style="grid-column: 1 / span 3;">
    	<button class="btn-wide primary-colour" style="font-size: x-small;"
    	onclick=${ e => {

    	    e.stopPropagation();

    		const btn = e.target;

    		if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

    		btn.classList.add('active');

    		_xyz.mapview.interaction.draw.begin({
    			layer: entry.location.layer,
    			type: 'LineString',
    			callback: () => {

    				btn.classList.remove('active');
    				
    				Object.values(entry.edit.group).map(el => {
    					if(!el) return;
    					el.remove();
    					el = null;
    				});
    				
    				
    			},
    			update: () => update(entry)
    		});

    	}}>Line`;

    	entry.edit.panel.appendChild(entry.edit.group.line);

    	return entry.edit.panel;
    }

    function edit(entry){

    	panel(entry);

    	if(entry.edit.group.edit) return entry.edit.panel;

    	entry.edit.group.edit = _xyz.utils.wire()`
    	    <div style="
    	    margin-top: 8px;
    	    grid-column: 1 / 3;
    	    display: grid;
    	    grid-template-columns: 50px 1fr;
    	    align-items: center;
    	    ">
    	    <div style="grid-column: 1 / span 3;">
    	    <button class="btn-wide primary-colour" style="font-size: x-small;"
    	    onclick=${ e => {

    	    	e.stopPropagation();

    			const btn = e.target;

    			if (btn.classList.contains('active')) return console.log('now cancel edit interaction');

    			//if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

    			btn.classList.add('active');

    			alert('Editing not implemented yet');

    			btn.classList.remove('active');
    	    
    	    }}>Edit`;

    	    entry.edit.panel.appendChild(entry.edit.group.edit);

    	    return entry.edit.panel;
    }

    function update(entry){

    	const features = _xyz.mapview.interaction.draw.Layer.getSource().getFeatures();

    	entry.newValue = JSON.parse(
    		_xyz.mapview.interaction.draw.format.writeFeature(
    			features[0],
    			{
    				dataProjection: 'EPSG:' + _xyz.mapview.interaction.draw.layer.srid,
    				featureProjection: 'EPSG:' + _xyz.mapview.srid
    			})).geometry;

    	entry.location.update();

    	_xyz.mapview.interaction.draw.finish();

    }

}
