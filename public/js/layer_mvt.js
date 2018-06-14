require('leaflet.vectorgrid');
const utils = require('./utils');

function getLayer(){
        
    // Assign the table based on the zoom array.
    let layer = this,
        zoom = _xyz.map.getZoom(),
        zoomKeys = Object.keys(layer.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
        layer.table = zoom > maxZoomKey ?
        layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];

    // Make drawer opaque if no table present.
    layer.drawer.style.opacity = !layer.table ? 0.4 : 1;
      
    if(layer.table && layer.display && layer.locale === _xyz.locale){

        // Create new vector.xhr
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest();

        // Build xhr request.
        let url = host + 'mvt/{z}/{x}/{y}?' + utils.paramString({
                dbs: layer.dbs,
                table: layer.table,
                qID: layer.qID,
                properties: layer.properties,
                layer: layer.layer,
                geom_3857: layer.geom_3857,
                tilecache: layer.tilecache
            }),
            options = {
                rendererFactory: L.svg.tile,
                interactive: (_xyz.select && layer.infoj && layer.qID) || false,
                pane: layer.pane[0],
                getFeatureId: (f) => f.properties.id,
                vectorTileLayerStyles: {}
            };
        
        // set style for each layer
        options.vectorTileLayerStyles[layer.layer] = applyLayerStyle;
        
        function applyLayerStyle(properties, zoom){
            if (layer.style && layer.style.theme && layer.style.theme.type === 'categorized' && layer.style.theme.cat[properties[layer.style.theme.field]]){
                return layer.style.theme.cat[properties[layer.style.theme.field]].style;
            }

            if (layer.style && layer.style.theme && layer.style.theme.type === 'graduated') {

                let style = layer.style.theme.cat[0].style;

                for (let i = 0; i < layer.style.theme.cat.length; i++) {
                    if (properties[layer.style.theme.field] < layer.style.theme.cat[i].val) break;
                    style = layer.style.theme.cat[i].style;
                }

                return style;

            }

            return layer.style.default;
        }
        
        if(layer.L) _xyz.map.removeLayer(layer.L);
        
        layer.L = L.vectorGrid.protobuf(url, options)
            .on('load', (e) => {
                layer.loaded = true;
                layer.loader.style.display = 'none';
                _xyz.layersCheck();
            })
            .on('click', (e) => {
                if( e.layer.properties.selected) return;
            
                e.layer.properties.selected = true;
            
                function checkCurrentSelection(e){
                    let check = false;
                    if(_xyz.hooks.select){
                        _xyz.hooks.select.map(item => {
                            item = item.split('!');
                            if(item[1] === layer.layer && item[2] === layer.table && item[3] === String(e.layer.properties.id)){
                                check = true;
                            } 
                        });
                    } 
                    return check;
                }
            
                if(!checkCurrentSelection(e)) {
                    // set cursor to wait
                    let els = _xyz.map.getContainer().querySelectorAll('.leaflet-interactive');
                    
                    for(let el of els){
                        el.classList += ' wait-cursor-enabled';
                    }
                    // get selection
                    _xyz.select.selectLayerFromEndpoint({
                        layer: layer.layer,
                        table: layer.table,
                        id: e.layer.properties.id,
                        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)]
                    });
                     e.layer.properties.selected = false;
                } else {
                    //console.log('feature ' + e.layer.properties.id + ' already selected');
                }
            
           
            })
            .on('mouseover', (e) => {
                e.target.setFeatureStyle(e.layer.properties.id, layer.style.highlight || {'color':'#090'});
                
            })
            .on('mouseout', (e) => {
                e.target.setFeatureStyle(e.layer.properties.id, applyLayerStyle);
            })
            .addTo(_xyz.map);

    }
}

module.exports = {
    getLayer: getLayer
}
