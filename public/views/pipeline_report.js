const params = {}

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
    params[key] = decodeURI(value)
})

window.onload = () => {
    _xyz({
        host: '/cook',
        locale: params.locale,
        //layer: params.layer,
        callback: xyz => page1(xyz) // page1 is layout and location elements
    })

    // _xyz({
    //     host: '/cook',
    //     locale: params.locale,
    //     // layer: params.layer,
    //     callback: xyz => page2(xyz)
    // })

    // _xyz({
    //     host: '/cook',
    //     locale: params.locale,
    //     // layer: params.layer,
    //     callback: xyz => page3(xyz)
    // })
}

function current_date() {

    let current_date = new Date()

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return `${current_date.getDate()} ${months[current_date.getMonth()]} ${current_date.getFullYear()}`
}

function page1(xyz) {

    xyz.mapview.create({
        target: document.getElementById('map'),
        scrollWheelZoom: true
    })

    xyz.layers.load(["Mapbox Base", "Retail Places", "Grocery", "Cook Pipeline"]).then(layers => {
      layers.forEach(layer => {
    
        // layer = xyz.layers.decorate(layer)
        // xyz.layers.list[layer.key] = layer
        layer.show()

      })
      
      //layers.forEach(layer => layer.show())
      locationsSelect()
    })

    // xyz.layers.list["Retail Places"].show()
    // xyz.layers.list["Grocery"].show()

    function locationsSelect() {

      xyz.locations.select({
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        id: params.id,
        callback: location => {

            xyz.locations.decorate(location);

            const site_name = location.infoj.find(entry => entry.field === 'name')

            location.infoj = location.infoj.filter(entry => entry.type !== 'geometry' && entry.type !== 'key' && entry.type !== 'report' && entry.type !== 'title')

            location.infoj.map(entry => { return entry.edit = false })

            xyz.locations.view.create(location)

            location.draw()

            location.flyTo()

            location.layer.show()

            document.getElementById('xyz_location') && document.getElementById('xyz_location').appendChild(xyz.locations.view.infoj(location))

            document.querySelectorAll('.xyz_site_name').forEach(s => s.textContent = site_name.value)

            document.querySelectorAll('.current_date').forEach(s => s.textContent = current_date())

            social_grade_vs_uk(xyz, Object.assign(params, { location: location }))

          }
      })

    }

}

function page2(xyz) {

    xyz.mapview.create({
        target: document.getElementById('map2'),
        scrollWheelZoom: true
    })

    xyz.layers.list["Retail Places"].show()
    xyz.layers.list["Retail Pitch"].show()
    xyz.layers.list["Grocery"].show()

    xyz.locations.select({
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        id: params.id,
        callback: location => {

            xyz.locations.decorate(location);

            const site_name = location.infoj.find(entry => entry.field === 'name')

            location.infoj = location.infoj.filter(entry => entry.type !== 'geometry' && entry.type !== 'key' && entry.type !== 'report' && entry.type !== 'dataview')

            location.infoj.map(entry => { return entry.edit = false })

            xyz.locations.view.create(location)

            location.draw()

            location.flyTo()

            location.layer.show()

        }
    })
}

function page3(xyz) {

    xyz.mapview.create({
        target: document.getElementById('map3'),
        scrollWheelZoom: true
    })

    xyz.locations.select({
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        id: params.id,
        callback: location => {

            xyz.locations.decorate(location);

            const site_name = location.infoj.find(entry => entry.field === 'name')

            location.infoj = location.infoj.filter(entry => entry.type !== 'key' && entry.type !== 'report' && entry.type !== 'dataview')

            location.infoj.map(entry => { return entry.edit = false })

            xyz.locations.view.create(location)

            location.draw()

            location.flyTo()

            location.layer.show()

        }
    })
}

function social_grade_vs_uk(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        type: "dataview",
        name: "Social Grade / UK",
        title: "Social Grade / UK",
        target: document.getElementById("xyz_social_grade_uk"),
        query: "uk_pipelines_social_grade_vs_uk",
        chart: {
            type: 'horizontalBar',
            height: 200,
            options: {
                legend: {
                    display: false
                },
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                layout: {
                    padding: {
                        left: 5,
                        right: 5,
                        top: 10,
                        bottom: 15
                    }
                },
                tooltips: {
                    callbacks: {
                        label: (item, data) => {
                            return `${item.yLabel}: ${parseInt(item.xLabel) + 100}`
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            callback: (value, index, values) => {
                                return parseInt(value) + 100
                            }
                        }
                    }]
                }
            }
        }
    }

    xyz.dataviews.create(entry)
}