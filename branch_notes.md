**Update leaflet to version 1.4.0.**

**utils.paramstring()** will no longer add empty keys.

**utils.createCheckbox()** now returns the input.

**utils.getCircularReplacer()** New method to replace circular reference when stringyfying JSON.


workspace init;

**hooks.remove()** will empty but not remove array hooks.

select hooks are retired.

locations are now stored in **hooks.current.locations[]**.

The location hook will be removed if a location cannot be selected.

**hooks.set()** uses now Object.assign instead of a single key/value pair.

The hooks object is structured as follows:

```
hooks : {
    current : {
        layers : [],
        locations : []
    },
    filter : ()=>{},
    push : ()=>{},
    remove : ()=>{},
    removeAll : ()=>{},
    set : ()=>{},
}
```

**mapview.draw.geoJSON**

Drawing GeoJSON to the map is now a drawing method on the mapview.


**Locations**

_xyz.locations has a **select()** method as well as location prototype object.

Calling _xyz.locations.select() with input parameters will create a location and get it's data from the XYZ middleware.

A location is created 


A location's own methods know their parent.

location.draw(), location.remove(), etc. do not need the location object as input parameter. 



```
locations : {
    select : {},
    location : {
        infoj : [],
        geometry : {},
        Geometry : {},
        marker : {},
        Marker : {},
        geometries : [],
        remove : ()=>{},
        get : ()=>{},
        draw : ()=>{},
        view : {
            update : {},
            node : {},
            geometry : {
                ctrl : {
                    isoline_here : ()=>{},
                    isoline_mapbox : ()=>{},
                    delete_geom : ()=>{},
                    show_geom : ()=>{},
                    hide_geom : ()=>{},
                }
            },
            group : {},
            groups : {},
            streetview : ()=>{},
            images : {
                ctrl : {
                    add_image : ()=>{},
                    delete_image : ()=>{},
                    upload_image : ()=>{},
                },
            }
        }
    }
}
```