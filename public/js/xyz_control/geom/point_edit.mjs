export default _xyz => (e, layer) => {

	if(!layer.edit || !layer.edit.point) return;

	_xyz.geom.contextmenu.close();

	_xyz.geom.contextmenu.create(e, {
		items: [{
			label: 'Edit me',
			onclick: editHandler
		}]
	});

    _xyz.map.once('click', e => _xyz.geom.contextmenu.close());

	function editHandler(){

        let
          count = e.layer.feature.properties.count,
          lnglat = e.layer.feature.geometry.coordinates;

        if(count > 1) return;

        var xhr = new XMLHttpRequest();

        const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

        xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          filter: JSON.stringify(filter),
          count: count > 99 ? 99 : count,
          lnglat: lnglat,
          token: _xyz.token
        }));

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';

        xhr.onload = _e => {

            if (_e.target.status !== 200) return;

            let cluster = _e.target.response;

            if (cluster.length > 1) return;

            xhr = new XMLHttpRequest();

            xhr.open('GET', 
            _xyz.host + '/api/location/select/id?' + 
            _xyz.utils.paramString({
                locale: _xyz.workspace.locale.key,
                layer: layer.key,
                table: layer.table,
                id: cluster[0].id,
                token: _xyz.token
            }));

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.responseType = 'json';

            xhr.onload = __e => {

                if (__e.target.status !== 200) return;

                layer.edit.vertices = _xyz.L.featureGroup()
                .on('click', e => _xyz.geom.contextmenu.close())
                .addTo(_xyz.map);

                layer.edit.vertices.clearLayers();

                layer.edit.vertices.addLayer(_xyz.L.circleMarker([__e.target.response.geomj.coordinates[1], __e.target.response.geomj.coordinates[0]], _xyz.style.defaults.vertex));

                layer.edit.vertices.eachLayer(l => {
                    l.editing.enable();
                    console.log(l);
                });

                _xyz.mapview.state = 'edit';

                _xyz.map.once('contextmenu', ev => {
                    _xyz.geom.contextmenu.close();

                    _xyz.geom.contextmenu.create(ev, {
                        items: [{
                            label: "Save me",
                            onclick: _ev => {
                                _ev.stopPropagation();

                                layer.edit.vertices.eachLayer(l => l.editing.disable());

                                let xhr = new XMLHttpRequest();

                                xhr.open('POST', _xyz.host + '/api/location/edit/geom/update?' + _xyz.utils.paramString({
                                    locale: _xyz.workspace.locale.key,
                                    layer: layer.key,
                                    table: layer.table,
                                    id: cluster[0].id,
                                    token: _xyz.token
                                }));

                                xhr.setRequestHeader('Content-Type', 'application/json');

                                xhr.onload = res => {
                                    layer.edit.vertices.clearLayers();
                                    layer.show();
                                }

                                xhr.send(JSON.stringify(layer.edit.vertices.toGeoJSON().features[0].geometry));

                                _xyz.geom.contextmenu.close();

                            }
                        }, {
                            label: "Cancel me",
                            onclick: _ev => {
                                _ev.stopPropagation();
                                layer.show();
                                layer.edit.vertices.eachLayer(l => l.editing.disable());
                                layer.edit.vertices.clearLayers();
                                _xyz.geom.contextmenu.close();
                            }
                        }]
                    });
                });
            }

            xhr.send();

        };

        xhr.send();

	}

}