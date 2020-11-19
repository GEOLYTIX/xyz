export default _xyz => {

    return {

        create: create,

        settings: settings

    }

    function settings(entry){

        if (entry.edit.isoline_here && !entry.edit.isoline_here.geometry && (entry.edit.isoline_here.minutes || entry.value)) return

        if (entry.edit.isoline_here && entry.edit.isoline_here.geometry && entry.edit.isoline_here.minutes && !entry.value) return

        // init params
        entry.edit.defaults = Object.assign({}, entry.edit.isoline_here)

        panel(entry)

        entry.container.parentNode.insertBefore(entry.edit.panel, entry.container.nextSibling)

        return 
    }

    function create (entry) {

        const range = (entry.edit.isoline_here.minutes || entry.edit.isoline_here.range) * 60

        const mode = `${entry.edit.isoline_here.mode || 'car'};${entry.edit.isoline_here.routingType || 'fastest'};${entry.edit.isoline_here.traffic || 'traffic:disabled'}`

        const geo = `geo!${entry.location.geometry.coordinates[1]},${entry.location.geometry.coordinates[0]}`

        const xhr = new XMLHttpRequest()

        xhr.open('GET', _xyz.host + '/api/provider/here?' +
            _xyz.utils.paramString({
                url: 'isoline.route.api.here.com/routing/7.2/calculateisoline.json?',
                mode: mode,
                start: entry.edit.isoline_here.destination ? null : geo,
                destination: entry.edit.isoline_here.destination ? geo : null,
                range: range,
                rangetype: entry.edit.isoline_here.rangetype || 'time',
                departure: entry.edit.isoline_here.destination ? null : (entry.edit.isoline_here.departure || 'now')
            }))

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';

        xhr.onload = e => {

            if (e.target.status !== 200 || !e.target.response.response) {
                entry.location.view && entry.location.view.classList.remove('disabled')
                console.log(e.target.response)
                return alert(_xyz.language.here_error)
            }

            entry.newValue = {
                'type': 'Polygon',
                'coordinates': [e.target.response.response.isoline[0].component[0].shape.map(el => el.split(',').reverse())]
            }

            if (entry.edit.meta) {

                let date = new Date()

                entry.location.infoj
                    .filter(_entry => _entry.type === 'json' && _entry.field === entry.edit.meta)
                    .forEach(meta => meta.newValue = {
                        [_xyz.language.here_recent]: "Here",
                        [_xyz.language.here_mode]: mode,
                        [_xyz.language.here_range_type]: entry.edit.isoline_here.rangetype,
                        [_xyz.language.here_range]: entry.edit.isoline_here.range,
                        [_xyz.language.here_created]: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes() > 8 ? date.getMinutes()+1 : `0${date.getMinutes()+1}`}`,
                        [_xyz.language.here_departure]: entry.edit.isoline_here.departure,
                        [_xyz.language.here_destination]: entry.edit.isoline_here.destination
                    })
            }

            if (entry.edit.panel) {
                entry.edit.panel.remove();
                entry.edit.panel = null;
                panel(entry);
            }

            entry.location.update();
        }

        xhr.send();

        entry.location.view && entry.location.view.classList.add('disabled')
    }

    function panel(entry) {

        if (entry.edit.panel) return

        if(entry.edit.isoline_here.minutes) return

        entry.edit.panel = _xyz.utils.html.node`
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

    function createElements(entry){

        entry.edit.panel.appendChild(_xyz.utils.html.node`
            <div style="padding-top: 5px; grid-column: 1 / 3;">
            <label class="input-checkbox">
            <input type="checkbox" "checked"=false
            onchange=${e => {
                entry.edit.isoline_here.traffic = e.target.checked ? 'traffic:enabled' : 'traffic:disabled'
            }}></input><div></div><span>${_xyz.language.here_enable_traffic}`)

        entry.edit.panel.appendChild(_xyz.utils.html.node`
            <div style="padding-top: 5px; grid-column: 1 / 3;">
            <label class="input-checkbox">
            <input type="checkbox" "checked"=false
            onchange=${e => {
                entry.edit.isoline_here.destination = e.target.checked
            }}></input><div></div><span>${_xyz.language.here_use_as_destination}`)

        const modes = [
            {
                [_xyz.language.here_driving]: 'car' },
            {
                [_xyz.language.here_walking]: 'pedestrian' },
            {
                [_xyz.language.here_cargo]: 'truck' },
            {
                [_xyz.language.here_hov_lane]: 'carHOV' }
        ]

        if(entry.edit.defaults.mode === undefined) {

            entry.edit.isoline_here.mode = Object.values(modes[0])[0]

            entry.edit.panel.appendChild(makeDropdown({
                title: _xyz.language.here_mode,
                options: modes,
                callback: (e, param) => {
                    entry.edit.isoline_here.mode = param
                }
            }))}

        const ranges = [
            {[_xyz.language.here_time]: "time" }//,
            //{[_xyz.language.here_distance]: "distance" } // supporting time range only atm
        ]

        entry.edit.isoline_here.rangetype = Object.values(ranges[0])[0]     

        const routingTypes = [
        {[_xyz.language.here_routing_type_fastest]: 'fastest'},
        {[_xyz.language.here_routing_type_shortest]: 'shortest'},
        {[_xyz.language.here_routing_type_balanced]: 'balanced'}]

        if(entry.edit.defaults.routingType === undefined) {
            entry.edit.isoline_here.routingType = Object.values(routingTypes[0])[0]

            entry.edit.panel.appendChild(makeDropdown({
                title: _xyz.language.here_routing_type,
                options: routingTypes,
                callback: (e, param) => {
                    entry.edit.isoline_here.routingType = param
                }
            }))
        }

        if(entry.edit.defaults.departure === undefined && entry.edit.defaults.arrival === undefined){

            let dateSelect = _xyz.utils.html.node `<input type="text" placeholder=${_xyz.language.layer_filter_pick} style="text-align: end;">`;

            entry.edit.panel.appendChild(_xyz.utils.html.node `
                <div style="margin-top: 12px; grid-column: 1 / 3; margin-bottom: 8px;">
                <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
                <div style="grid-column: 1;"><span>Depart at </span></div>
                <div style="grid-column: 2;">${dateSelect}</div>`)

            _xyz.utils.flatpickr({
                element: dateSelect,
                enableTime: true,
                callback: dateStr => {
                    dateSelect.value = dateStr

                    let dateISO = new Date(dateStr).toISOString()

                    entry.edit.isoline_here.departure = dateISO

                }
            });
        }

        if(entry.edit.defaults.range === undefined) {

            entry.edit.isoline_here.range = 10

            entry.edit.panel.appendChild(makeSlider({
                title: _xyz.language.here_travel_time,
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

    function makeSlider(params){
        return _xyz.utils.html.node`
        <div style="margin-top: 12px; grid-column: 1 / 3;">
        <span>${params.title}</span>
        <span class="bold">${params.range}</span>
        <div class="input-range">
        <input
          class="secondary-colour-bg"
          type="range"
          min=5
          value=${params.range}
          max=60
          step=1
          oninput=${e=>{
            e.target.parentNode.previousElementSibling.textContent = parseInt(e.target.value)
            if(params.callback) params.callback(e)
          }}>`
    }
}