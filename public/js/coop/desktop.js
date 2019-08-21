_xyz({
	host: document.head.dataset.dir,
	callback: _xyz => {
		_xyz.mapview.create({
			target: document.getElementById('_map'),
			scrollWheelZoom: true,
			zoomControl: true
		});

		const layer_dropdown_options = [];

		const core_layer_key = 'Wellbeing Index';
		const core_layer = _xyz.layers.list[core_layer_key];
		const core_layer_themes = _xyz.layers.list[core_layer_key].style.themes;
		const core_layer_themes_options = [];

		Object.keys(core_layer.style.themes).map(key => {
			core_layer_themes_options.push(key);
		});

		Object.values(_xyz.layers.list).map(layer => {
			if(layer.group && layer.group === 'Locations'){
				
				layer_dropdown_options.push({
					[layer.key]: layer.name || layer.key
				});
			}
		});

		const core_layer_themes_dropdown = _xyz.utils.dropdownCustom({
			entries: core_layer_themes_options,
			singleSelect: true,
			selectedIndex: 0,
			callback: e => {
				
				e.stopPropagation();

				core_layer_themes_dropdown.querySelector('.head').textContent = e.target.textContent;
				
				let new_theme = core_layer.style.themes[e.target.dataset.field];

				let style = Object.assign({}, core_layer.style.default);

				let new_style = function(){
					if (new_theme.type === 'categorized') {
						return Object.assign({}, style, new_theme.cat[core_layer.mvt_fields[new_theme.field]] || {});
					}

					if (new_theme.type === 'graduated') {

						new_theme.cat_arr = Object.entries(new_theme.cat).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
						new_theme.cat_style = {};

						for (let i = 0; i < new_theme.cat_arr.length; i++) {

							if (!core_layer.mvt_fields[new_theme.field]) return style;
							if (parseFloat(core_layer.mvt_fields[new_theme.field]) < parseFloat(new_theme.cat_arr[i][0])) break;

							new_theme.cat_style = new_theme.cat_arr[i][1];
						}

						return Object.assign({}, style, new_theme.cat_style);
					}
				}();

				core_layer.style.theme = new_theme;
				core_layer.loaded = false;
				// apply theme
				core_layer.get();
			}
		});

		const layer_dropdown = _xyz.utils.dropdownCustom({
			entries: layer_dropdown_options,
			callback: e => {

				Object.values(_xyz.layers.list).map(layer => {
					if(layer.group && layer.group === 'Locations'){
						layer.display = layer.key === e.target.dataset.field  ? true : false;
						console.log('do soemthing with this layer ' + layer.key);
						//layer.get();
					}
				});
				
			}
		});


		document.getElementById('layer_dropdown').appendChild(layer_dropdown);
		document.getElementById('core_layer_themes_dropdown').appendChild(core_layer_themes_dropdown);

	}
});