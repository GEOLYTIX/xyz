**utils.paramstring()** will no longer add empty keys.

**hooks.remove()** will empty but not remove array hooks.

select hooks are retired.

locations are now stored in **hooks.current.locations[]**.

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


```
locations : {
    select : {},
    draw : {},
    drawGeoJSON : {},
    location : {
        infoj : {},
        geometry : {},
        geometries : [],
        marker : {},
        remove : {},
        get : {},
        view : {
            update : {},
            node : {},
            geometry : {
                isoline...
            },
            group : {},
            groups : {},
            streetview : {},
            images : {
                ctrl : {},
                add_image : {},
                delete_image : {},
                upload_image : {}
            }
        }

    }
}
```