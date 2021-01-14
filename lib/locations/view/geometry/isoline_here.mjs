export default _xyz => {

    return {

        create: create,

        settings: settings

    }

    function settings(entry) {

        if (entry.edit.defaults === undefined) entry.edit.defaults = Object.assign({}, entry.edit.isoline_here)

        if (entry.edit.isoline_here && !entry.edit.isoline_here.geometry && (entry.edit.isoline_here.minutes || entry.value)) return

        if (entry.edit.isoline_here && entry.edit.isoline_here.geometry && entry.edit.isoline_here.minutes && !entry.value) return


        panel(entry)

        entry.container && entry.container.parentNode.insertBefore(entry.edit.panel, entry.container.nextSibling)

        return
    }

    function create(entry) {

        if (entry.edit.defaults === undefined) entry.edit.defaults = Object.assign({}, entry.edit.isoline_here)

        const range = (entry.edit.isoline_here.minutes || entry.edit.isoline_here.range) * 60

        const ll = ol.proj.toLonLat(entry.location.geometry.coordinates, `EPSG:${entry.location.layer.srid}`)

        const destination = entry.edit.isoline_here.destination || entry.edit.defaults.destination

        const dateISO = entry.edit.isoline_here.dateISO ? new Date(entry.edit.isoline_here.dateISO).toISOString() : entry.edit.defaults.dateISO ? new Date(entry.edit.defaults.dateISO).toISOString() : null

        const params = {
            transportMode: entry.edit.isoline_here.transportMode || 'car',
            [destination ? 'destination' : 'origin']: `${ll[1]},${ll[0]}`,
            "range[values]": range || 10 * 60,
            "range[type]": entry.edit.isoline_here.rangetype || 'time',
            optimizeFor: entry.edit.isoline_here.optimizeFor || 'balanced'
        }

        if (dateISO) {
            Object.assign(params, {
                [destination ? 'arrivalTime' : 'departureTime']: dateISO })
        }

        _xyz
            .proxy(`https://isoline.router.hereapi.com/v8/isolines?${_xyz.utils.paramString(params)}&{HERE}`)
            .then(response => {

                if (!response.isolines) {
                    console.log(response)
                    return alert(_xyz.language.here_error)
                }

                if (!response.isolines[0].polygons.length) {
                    entry.location.view && entry.location.view.classList.remove('disabled')
                    return
                } else {
                    
                    const coordinates = _xyz.utils.isoline_here_decode(response.isolines[0].polygons[0].outer)

                    coordinates.polyline.map(p => { return p.reverse() })

                    entry.newValue = {
                        type: 'Polygon',
                        coordinates: [coordinates.polyline]
                    }

                    if (entry.edit.meta) {

                        let date = new Date()

                        entry.location.infoj
                            .filter(_entry => _entry.type === 'json' && _entry.field === entry.edit.meta)
                            .forEach(meta => meta.newValue = Object.assign({
                                "provider": "Here"
                            }, params))
                    }

                    if (entry.edit.panel) {
                        entry.edit.panel.remove();
                        entry.edit.panel = null;
                        panel(entry);
                    }

                    entry.location.update();

                    if (!entry.edit.defaults.dateISO) entry.edit.isoline_here.dateISO = null
                    if (!entry.edit.defaults.destination) entry.edit.isoline_here.destination = null
                }

                entry.location.view && entry.location.view.classList.add('disabled')



            })


    }

    function panel(entry) {

        if (entry.edit.panel) return

        if (entry.edit.isoline_here.minutes) return

        entry.edit.panel = _xyz.utils.html.node `
        <div
        class="${`drawer group panel expandable ${entry.class || ''}`}"
        style="display: grid; grid-column: 1 / 3; border-bottom: solid 1px grey;">
        <div
        class="header primary-colour"
        style="text-align: left; grid-column: 1 / 3;"
        onclick=${e => {
          _xyz.utils.toggleExpanderParent(e.target)
        }}
        ><span>${_xyz.language.here_isoline_settings}</span>
        <span class="xyz-icon btn-header icon-expander primary-colour-filter">`

        createElements(entry)
    }

    function createElements(entry) {

        let date_picker_label = _xyz.utils.html.node `<span>${_xyz.language.here_depart}`

        entry.edit.panel.appendChild(_xyz.utils.html.node `
            <div style="padding-top: 5px; grid-column: 1 / 3;">
            <label class="input-checkbox">
            <input type="checkbox" "checked"=false
            onchange=${e => {
                date_picker_label.textContent = e.target.checked ? `${_xyz.language.here_arrive}` : `${_xyz.language.here_depart}`
                entry.edit.isoline_here.destination = e.target.checked
            }}></input><div></div><span>${_xyz.language.here_use_as_destination}`)

        const transportModes = [{
                [_xyz.language.here_driving]: 'car'
            },
            {
                [_xyz.language.here_walking]: 'pedestrian'
            },
            {
                [_xyz.language.here_cargo]: 'truck'
            }
        ]

        if (entry.edit.defaults.transportMode === undefined) {

            entry.edit.panel.appendChild(makeDropdown({
                title: _xyz.language.here_transport_mode,
                options: transportModes,
                callback: (e, param) => {
                    entry.edit.isoline_here.transportMode = param
                }
            }))
        }

        const ranges = [
            {
                [_xyz.language.here_time]: "time" } //,
            //{[_xyz.language.here_distance]: "distance" } // supporting time range only atm
        ]

        const routingTypes = [
            {
                [_xyz.language.here_routing_type_fastest]: 'fast' },
            {
                [_xyz.language.here_routing_type_shortest]: 'short' }
        ]

        if (entry.edit.defaults.routingType === undefined) {

            entry.edit.panel.appendChild(makeDropdown({
                title: _xyz.language.here_routing_type,
                options: routingTypes,
                callback: (e, param) => {
                    entry.edit.isoline_here.routingType = param
                }
            }))
        }

        const optimizeFor = [
            {
                [_xyz.language.here_optimize_for_balanced]: 'balanced' },
            {
                [_xyz.language.here_optimize_for_quality]: 'quality' },
            {
                [_xyz.language.here_optimize_for_performance]: 'performance' }
        ]

        if (entry.edit.defaults.optimizeFor === undefined) {

            entry.edit.panel.appendChild(makeDropdown({
                title: _xyz.language.here_optimize_for,
                options: optimizeFor,
                callback: (e, param) => {
                    entry.edit.isoline_here.optimizeFor = param
                }
            }))
        }

        if (entry.edit.defaults.departureTime === undefined && entry.edit.defaults.arrivalTime === undefined) {

            let dateSelect = _xyz.utils.html.node `<input type="text" placeholder=${_xyz.language.layer_filter_pick} style="text-align: end;">`;

            entry.edit.panel.appendChild(_xyz.utils.html.node `
                <div style="margin-top: 12px; grid-column: 1 / 3; margin-bottom: 8px;">
                <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
                <div style="grid-column: 1;">${date_picker_label}</div>
                <div style="grid-column: 2;">${dateSelect}</div>`)

            _xyz.utils.flatpickr({
                locale: _xyz.hooks.current.language || null,
                element: dateSelect,
                enableTime: true,
                callback: dateStr => {
                    dateSelect.value = dateStr

                    entry.edit.isoline_here.dateISO = new Date(dateStr).toISOString()

                }
            });
        }

        if (entry.edit.defaults.range === undefined) {

            entry.edit.panel.appendChild(makeSlider({
                title: _xyz.language.here_travel_time,
                max: entry.edit.isoline_here.maxMinutes,
                range: 10,
                callback: e => {
                    entry.edit.isoline_here.range = parseInt(e.target.value)
                }
            }))
        }
    }

    function makeDropdown(params) {

        return _xyz.utils.html.node `<div style="margin-top: 8px; grid-column: 1 / 3; align-items: center;">
            <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
            <div style="grid-column: 1;">${params.title}</div>
            <div style="grid-column: 2;">
            <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
                    e.preventDefault();
                    e.target.parentElement.classList.toggle('active');
                }}>
                <span>${Object.keys(params.options[0])}</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${params.options.map(
                keyVal => _xyz.utils.html.node`
                <li onclick=${e=>{
                    const drop = e.target.closest('.btn-drop');
                    drop.classList.toggle('active');
                    drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];
                    if(params.callback) params.callback(e, Object.values(keyVal)[0]);
                
                }}>${Object.keys(keyVal)[0]}`)}`;
    }

    function makeSlider(params) {
        return _xyz.utils.html.node `
        <div style="margin-top: 12px; grid-column: 1 / 3;">
        <span>${params.title}</span>
        <span class="bold">${params.range}</span>
        <div class="input-range">
        <input
          class="secondary-colour-bg"
          type="range"
          min=5
          value=${params.range}
          max=${params.max || 30}
          step=1
          oninput=${e=>{
            e.target.parentNode.previousElementSibling.textContent = parseInt(e.target.value)
            if(params.callback) params.callback(e)
          }}>`
    }
}