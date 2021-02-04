document.dispatchEvent(new CustomEvent('style_icon_scaling', { detail: create }))

function create(_xyz) {

    _xyz.layers.plugins.style_icon_scaling = layer => {

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


        grid.appendChild(_xyz.utils.html.node`<div class="header primary-colour" style-"grid-column: 1/2;"><span><b>Icon`)

        grid.appendChild(icon_scale({
                title: 'Scale',
                min: 0.1,
                max: 5,
                step: 0.1,
                value: 1
            }))


        let div = _xyz.utils.html.node`<div>`

        div.appendChild(grid)
        
        panel.appendChild(div)

        return layer.view.appendChild(panel)


        function icon_scale(params) {

            if(layer.style.theme && layer.style.theme.cat) {

                Object.values(layer.style.theme.cat).map(c => {

                    c.initial_scale = c.scale || 1
                })
            }

            if(layer.style.theme && layer.style.theme.cat_arr) {

                layer.style.theme.cat_arr.map(c => {

                    c.initial_scale = c.scale || 1
                })
            }


            layer.style.default.initial_scale = layer.style.default.scale || 1

            if(layer.style.cluster) layer.style.cluster.initial_scale = layer.style.cluster.scale || 1

        	return _xyz.utils.html.node `
        	<div style="grid-column: 1;">${params.title}</div>
            <div style="grid-column: 2;">${layer.style.default.scale || 1}</div>
        	<div class="input-range"  style="grid-column: 3;">
        	<input
        	type="range"
        	class="secondary-colour-bg"
        	min=${params.min || 0}
        	value=${params.value || 1}
        	max=${params.max || 1}
        	step=${params.step || 0.1}
        	oninput=${e=>{

                layer.style.default.scale = layer.style.default.initial_scale * e.target.value
                layer.style.cluster.scale = layer.style.cluster.initial_scale * e.target.value


        		if(layer.style.theme) {
        			
                    if(layer.style.theme.cat) {

                        Object.values(layer.style.theme.cat).map(c => {
                            
                            c.scale = c.initial_scale * e.target.value
                        })
        			}

        			if(layer.style.theme.cat_arr) {

                        layer.style.theme.cat_arr.map(c => {

                            c.scale = c.initial_scale * e.target.value
                        
                        })
        			}
        		} 

        		e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value
        		
                clearTimeout(timeout)
        		timeout = setTimeout(() => {
        			layer.reload()

        		}, 1000)

        	}}>`
        }
    }
}