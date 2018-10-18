import _xyz from '../../../_xyz.mjs';
import style from './style.mjs';
import { switchState } from './_draw.mjs';

export default (e, layer) => {
    e.stopPropagation();

    layer.edited = layer.edited ? false : true;

    let btn = e.target;

    if(layer.edited && !layer.display){
        layer.display = true;
        layer.toggle.textContent = layer.display ? 'layers' : 'layers_clear';
        _xyz.hooks.push('layers', layer.key);
        layer.get();
    }

    if(!layer.edited){
        layer.header.classList.remove('edited')
    } else {
        layer.header.classList.add('edited');
        _xyz.dom.map.style.cursor = 'crosshair';

        _xyz.map.on('click', e => {
            let marker = [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)];

            _xyz.map.off('click');
            _xyz.dom.map.style.cursor = '';
            
            // Make select tab active on mobile device.
            //if (global._xyz.activateLocationsTab) global._xyz.activateLocationsTab();
            let xhr = new XMLHttpRequest();
            
            xhr.open('POST', _xyz.host + '/api/location/new?token=' + _xyz.token);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = e => {
                if (e.target.status === 401) {
                    document.getElementById('timeout_mask').style.display = 'block';
                    //console.log(e.target.response);
                    return
                }
                
                if (e.target.status === 200) {
                    layer.get();
                    
                    _xyz.locations.select({
                        layer: layer.key,
                        table: layer.table,
                        id: e.target.response,
                        marker: marker,
                        editable: true
                    });
                }
            }
            
            xhr.send(JSON.stringify({
                locale: _xyz.locale,
                layer: layer.key,
                table: layer.table,
                geometry: {
                    type: "Point",
                    coordinates: marker
                }
            }));
        });
    }
}