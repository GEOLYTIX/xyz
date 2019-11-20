export default _xyz => layer => {

    if (typeof(layer.edit.isoline_mapbox) !== 'object') layer.edit.isoline_mapbox = {};   
    
    const container = _xyz.utils.wire()`<div>`;

    const group = _xyz.utils.wire()`
    <div class="drawer panel expandable">`;

    group.appendChild(_xyz.utils.wire()`
    <div
        class="header primary-colour"
        style="text-align: left; font-weight: 400;"
        onclick=${e => {
            if (e) e.stopPropagation();
            _xyz.utils.toggleExpanderParent(e.target);
        }}>Mapbox Isoline settings`);

    layer.edit.isoline_mapbox.profile = layer.edit.isoline_mapbox.profile || 'driving';
    layer.edit.isoline_mapbox.minutes = layer.edit.isoline_mapbox.minutes || 10;

    const modes = [
        { Driving : 'driving' },
        { Walking: 'walking' },
        { Cycling: 'cycling' },
    ]

    layer.edit.isoline_mapbox.profile = 'driving';  

    group.appendChild(_xyz.utils.wire()`
    <div
        style="margin-top: 8px; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
        <span style="grid-column: 1;">Mode</span>
        <div style="grid-column: 2;">
        <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
                    e.preventDefault();
                    e.target.parentElement.classList.toggle('active');
                }}>
                <span>Driving</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${modes.map(
                keyVal => _xyz.utils.wire()`
                <li onclick=${e=>{
                    const drop = e.target.closest('.btn-drop');
                    drop.classList.toggle('active');
                    drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];
        
                    layer.edit.isoline_mapbox.profile = Object.values(keyVal)[0];
        
                }}>${Object.keys(keyVal)[0]}`)}`);
    
    group.appendChild(_xyz.utils.wire()`
    <div style="margin-top: 12px;">
        <span>Travel time in minutes: </span>
        <span class="bold">${layer.edit.isoline_mapbox.minutes}</span>
        <div class="input-range">
        <input
        class="secondary-colour-bg"
        type="range"
        min=5
        value=${layer.edit.isoline_mapbox.minutes}
        max=60
        step=1
        oninput=${e=>{
            layer.edit.isoline_mapbox.minutes = parseInt(e.target.value);
            e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_mapbox.minutes;
        }}>`);


container.appendChild(group);

// Add state button to init drawing.
container.appendChild(_xyz.utils.wire()`
    <button
        class="btn-wide primary-colour"
        onclick=${e => {

            e.stopPropagation();
            const btn = e.target;

            if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.finish();

            btn.classList.add('active');
            layer.show();
            layer.view.querySelector('.header').classList.add('edited', 'secondary-colour-bg');

            _xyz.mapview.interaction.draw.begin({
                layer: layer,
                type: 'Point',
                geometryFunction: function(coordinates, geometry) {

                    geometry = new _xyz.mapview.lib.geom.Circle(coordinates, layer.edit.isoline_mapbox.minutes * 1000);
                    
                    //var feature = new _xyz.mapview.lib.Feature({ geometry: geometry });

                    const origin = _xyz.mapview.lib.proj.transform(coordinates, `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326');

                    const xhr = new XMLHttpRequest();

                    xhr.open('GET', _xyz.host +
                        '/api/location/edit/isoline/mapbox?' +
                        _xyz.utils.paramString({
                            locale: _xyz.workspace.locale.key,
                            coordinates: origin.join(','),
                            minutes: layer.edit.isoline_mapbox.minutes,
                            profile: layer.edit.isoline_mapbox.profile,
                            token: _xyz.token
                        }));

                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.responseType = 'json';

                    xhr.onload = e => {
                    
                        if (e.target.status !== 200) return alert('No route found. Try a longer travel time or alternative setup.');

                        const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

                        const feature = geoJSON.readFeature({
                            type: 'Feature',
                            geometry: e.target.response
                        },{ 
                            dataProjection: 'EPSG:4326',
                            featureProjection:'EPSG:' + _xyz.mapview.srid
                        });

                        _xyz.mapview.interaction.draw.Source.clear();

                        _xyz.mapview.interaction.draw.Source.addFeature(feature);
                                                
                    };

                    xhr.send();

                    return geometry;
                },
                callback: () => {
                    layer.view.querySelector('.header').classList.remove('edited', 'secondary-colour-bg');
                    btn.classList.remove('active');
                }
            });

        }}>Isoline Mapbox`);

    return container;

}