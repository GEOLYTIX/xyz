document.dispatchEvent(new CustomEvent('style_settings', { detail: create }))

function create(_xyz) {

    _xyz.layers.plugins.style_settings = layer => {

        let timeout

        const panel = _xyz.utils.html.node`<div class="drawer panel expandable">`

        panel.appendChild(_xyz.utils.html.node`
        	<div class="header primary-colour"
        	onclick=${e => {
        		e.stopPropagation()
        		_xyz.utils.toggleExpanderParent(e.target, true)
        	}}>
        	<span>Visual Adjustment</span>
        	<button class="btn-header xyz-icon icon-expander primary-colour-filter">`)

        const grid = _xyz.utils.html.node `
			<div style="display: grid; align-items: center;">`

        const types = {
            text: textInput,
            range: rangeInput
        }

        grid.appendChild(_xyz.utils.html.node`<div class="header primary-colour" style-"grid-column: 1/2;"><span><b>Fill`)

        grid.appendChild(textInput({
                title: 'Colour',
                field: 'fillColor',
            	colour: true
            }))

        grid.appendChild(rangeInput({
                title: 'Opacity',
                field: 'fillOpacity',
                min: 0,
                max: 1,
                step: 0.1
            }))

        grid.appendChild(_xyz.utils.html.node`<div class="header primary-colour" style-"grid-column: 1/2;"><span><b>Stroke`)


            grid.appendChild(textInput({
                title: 'Stroke',
                field: 'strokeColor',
                colour: true
            }))

            grid.appendChild(rangeInput({
                title: 'Width',
                field: 'strokeWidth',
                min: 1,
                max: 10,
                step: 1
            }))

            grid.appendChild(rangeInput({
                title: 'Opacity',
                field: 'strokeOpacity',
                min: 0,
                max: 1,
                step: 0.1
            }))

            if(layer.style.label) {

            	grid.appendChild(_xyz.utils.html.node`<div class="header primary-colour" style-"grid-column: 1/2;"><span><b>Labels`)
            	
            	grid.appendChild(textInput({
            		title: 'Colour',
            		style: 'label',
            		field: 'fillColor',
            		colour: true
            	}))

            	grid.appendChild(textInput({
            		title: 'Stroke colour',
            		style: 'label',
            		field: 'strokeColor',
            		colour: true
            	}))

            	grid.appendChild(rangeInput({
            		title: 'Stroke Width',
            		style: 'label',
            		field: 'strokeWidth',
            		min: 1,
                    max: 10,
                    step: 1
            	}))

            	grid.appendChild(textInput({
            		title: 'Font',
            		style: 'label',
            		field: 'font',
            		placeholder: '12px sans-serif'
            	}))
            }

        let div = _xyz.utils.html.node`<div>`

        div.appendChild(grid)
        
        panel.appendChild(div)

        return layer.view.appendChild(panel)


        function textInput(params) {

        	return _xyz.utils.html.node `
        	<div style="grid-column: 1;">${params.title}</div>
        	<input
        	placeholder="${params.placeholder}"
        	style="${params.colour ? `grid-column: 3; border-color: ${layer.style[params.style || 'default'][params.field]};` : 'grid-column: 3;'}"
        	value=${layer.style[params.style || 'default'][params.field]}
        	onchange=${e=>{

        		if(params.colour) e.target.style.borderColor = e.target.value

        		if(params.style !== 'label' && layer.style.theme) {
        			if(layer.style.theme.cat) {
        				Object.values(layer.style.theme.cat).map(c => c.style[params.field] = e.target.value)
        			}

        			if(layer.style.theme.cat_arr) {
        				layer.style.theme.cat_arr.map(c => c.style[params.field] = e.target.value)
        			}
        		}

        		layer.style[params.style || 'default'][params.field] = e.target.value
        		clearTimeout(timeout)
        		timeout = setTimeout(() => {
        			layer.reload()
        			
        			if(params.style === 'label') {
        				_xyz.map.removeLayer(layer.label)
        				layer.label = _xyz.mapview.layer.mvtLabel(layer);
        				_xyz.map.addLayer(layer.label)
        			}

        		}, 1000)
        	}}>`
        }

        function rangeInput(params) {

        	return _xyz.utils.html.node `
        	<div style="grid-column: 1;">${params.title}</div>
        	<div style="grid-column: 2;">${layer.style[params.style || 'default'][params.field]}</div>
        	<div class="input-range"  style="grid-column: 3;">
        	<input
        	type="range"
        	class="secondary-colour-bg"
        	min=${params.min || 0}
        	value=${layer.style[params.style || 'default'][params.field]}
        	max=${params.max || 1}
        	step=${params.step || 0.1}
        	oninput=${e=>{

        		if(params.style !== 'label' && layer.style.theme) {
        			if(layer.style.theme.cat) {
        				Object.values(layer.style.theme.cat).map(c => c.style[params.field] = e.target.value)
        			}

        			if(layer.style.theme.cat_arr) {
        				layer.style.theme.cat_arr.map(c => c.style[params.field] = e.target.value)
        			}
        		}

        		layer.style[params.style || 'default'][params.field] = e.target.value
        		e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value
        		clearTimeout(timeout)
        		timeout = setTimeout(() => {
        			layer.reload()

        			if(params.style === 'label') {
        				_xyz.map.removeLayer(layer.label)
        				layer.label = _xyz.mapview.layer.mvtLabel(layer);
        				_xyz.map.addLayer(layer.label)
        			}

        		}, 1000)
        	}}>`
        }
    }
}