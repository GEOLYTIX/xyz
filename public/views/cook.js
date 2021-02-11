const params = {}

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
    params[key] = decodeURI(value)
})

window.onload = () => {
    _xyz({
        host: '/cook',
        locale: params.locale,
        callback: xyz => page1(xyz) // page1 is layout and location elements
    })

     _xyz({
         host: '/cook',
         locale: params.locale,
         callback: xyz => page2(xyz)
    })

    _xyz({
        host: '/cook',
        locale: params.locale,
        callback: xyz => page3(xyz)
    })

    _xyz({
        host: '/cook',
        locale: params.locale,
        callback: xyz => page4(xyz)
    })

    _xyz({
        host: '/cook',
        locale: params.locale,
        callback: xyz => page5(xyz)
    })
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

  xyz.layers.load(["Mapbox Base", "Cook Stores", "Cook Concessions", params.layer]).then(layers => {
    layers.forEach(layer =>  {
        layer.show()

        if(layer.key !== 'Mapbox Base') {

            document.getElementById('legend').appendChild(xyz.utils.html.node`
                <div><img class="btn-header"
                src="${xyz.utils.svg_symbols(xyz.layers.list[layer.key].style.default)}">${layer.key}`)
        }
    })
    locationsSelect()
  })

  function locationsSelect() {

    xyz.locations.select({
      locale: params.locale,
      layer: params.layer,
      table: xyz.layers.list[params.layer].table,
      id: params.id,
      callback: location => {

          xyz.locations.decorate(location);

          const site_name = location.infoj.find(entry => entry.field === 'name')

          const postcode = location.infoj.find(entry => entry.field === 'postal_sector')

          location.infoj = location.infoj.filter(entry => entry.type !== 'geometry' && entry.type !== 'key' && entry.type !== 'report' && !(entry.type === 'title' && !entry.class))

          location.infoj.map(entry => { return entry.edit = false })

          xyz.locations.view.create(location)

          location.draw()

          location.flyTo()

          location.layer.show()

          document.getElementById('xyz_location') && document.getElementById('xyz_location').appendChild(xyz.locations.view.infoj(location))

          document.querySelectorAll('.xyz_site_name').forEach(s => s.textContent = site_name.value)

          document.querySelectorAll('.xyz_postcode').forEach(s => { if(postcode.value) s.textContent = `, ${postcode.value}` })

          document.querySelectorAll('.current_date').forEach(s => s.textContent = current_date())

          xyz.query({
            layer: xyz.layers.list[params.layer],
            query: 'uk_sites_pipeline_area_leader',
            locale: params.locale,
            location: { id: params.id}
          }).then(response => document.querySelectorAll('.area_leader').forEach(s => {if(s) s.textContent = `, ${response.manager}`}))

            social_grade_vs_uk(xyz, Object.assign(params, { location: location }))
            disposable_income(xyz, Object.assign(params, {location: location}))
            home_ownership(xyz, Object.assign(params, {location: location}))
            age_profile(xyz, Object.assign(params, { location: location }))
            oac_profile(xyz, Object.assign(params, { location: location }))
            customer_profile(xyz, Object.assign(params, { location: location }))

        }
    })

  }
}

function page2(xyz) {

    xyz.mapview.create({
        target: document.getElementById('map2'),
        scrollWheelZoom: true
    })

    xyz.layers.load(["Mapbox Base", "Retail Places", "Retail Pitch", "Grocery", params.layer]).then(layers => {

        layers.forEach(layer =>  layer.show())

        xyz.locations.select({
            locale: params.locale,
            layer: params.layer,
            table: xyz.layers.list[params.layer].table,
            id: params.id,
            callback: location => {

                xyz.locations.decorate(location)
                const site_name = location.infoj.find(entry => entry.field === 'name')
                location.infoj = location.infoj.filter(entry => entry.type !== 'geometry' && entry.type !== 'key' && entry.type !== 'report' && entry.type !== 'dataview')
                location.infoj.map(entry => { return entry.edit = false })

                xyz.locations.view.create(location)
                location.draw()
                location.flyTo()
                location.layer.show()
            }
        })  
    })
}

function page3(xyz) {

    xyz.mapview.create({
        target: document.getElementById('map3'),
        scrollWheelZoom: true
    })

    xyz.layers.load(["Mapbox Base", params.layer]).then(layers => {

        layers.forEach(layer =>  layer.show())

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
    })
}

function page4(xyz) {
    
    xyz.mapview.create({
        target: document.getElementById('map4'),
        scrollWheelZoom: true
    })

    xyz.layers.load(["Mapbox Base", "Potential Score", params.layer]).then(layers => {
        
        layers.forEach(layer =>  {
            if(layer.key === params.layer) {
                layer.filter.current = {}
                layer.filter.current['ogc_fid'] ={}
                layer.filter.current['ogc_fid'].match = params.id
            }
            layer.show()

            if(layer.key === "Potential Score") document.getElementById('legend4').appendChild(xyz.layers.view.style.legend(layer))
        })

        xyz.locations.select({
            locale: params.locale,
            layer: params.layer,
            table: xyz.layers.list[params.layer].table,
            id: params.id,
            callback: location => {

                xyz.locations.decorate(location)
                const site_name = location.infoj.find(entry => entry.field === 'name')
                location.infoj = location.infoj.filter(entry => entry.type !== 'key' && entry.type !== 'report' && entry.type !== 'dataview')
                location.infoj.map(entry => { return entry.edit = false })

                xyz.locations.view.create(location)
                location.draw()
                location.flyTo()
                location.layer.show()
            }
        })
    })
}

function page5(xyz){

    xyz.mapview.create({
        target: document.getElementById('map5'),
        scrollWheelZoom: true
    })

    xyz.layers.load(["Mapbox Base", "Cook Stores", params.layer]).then(layers => {


        layers.forEach(layer =>  { 
            if(layer.key === params.layer) {
                layer.filter.current = {}
                layer.filter.current['ogc_fid'] ={}
                layer.filter.current['ogc_fid'].match = params.id
            }
            else {
                if(layer.style && layer.style.label) layer.style.label.display = true
            }
            layer.show() 
        }) 

        xyz.query({
            layer: xyz.layers.list[params.layer],
            query: 'uk_pipelines_nearest_stores_map',
            locale: params.locale,
            location: { id: params.id}
        }).then(response => {
            let ids = response.map(r => {return r.id})
            let catchments = response.map(r => {return r.catchment})

            catchments.map(catchment => {
                xyz.mapview.geoJSON({
                    geometry: JSON.parse(catchment),
                    dataProjection: 4326,
                    zIndex: 5,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: xyz.utils.Chroma('#F38D68').alpha(1),
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: xyz.utils.Chroma('#F38D68').alpha(0.2).rgba()
                        })
                    })
                })
            })

            xyz.locations.select({
                locale: params.locale,
                layer: params.layer,
                table: xyz.layers.list[params.layer].table,
                id: params.id,
                callback: location => {

                    xyz.locations.decorate(location)
                    location.infoj = location.infoj.filter(entry => entry.field === 'here_isoline_10min')
                    xyz.locations.view.create(location)
                    location.draw()
                    location.layer.show()
                }
            })

            xyz.layers.list["Cook Stores"].filter.current = {}
            xyz.layers.list["Cook Stores"].filter.current['store_id'] ={};
            xyz.layers.list["Cook Stores"].filter.current['store_id'].in = ids
            xyz.layers.list["Cook Stores"].reload()
            xyz.layers.list["Cook Stores"].zoomToExtent()
        })
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
        query: "uk_pipelines_social_grade_chart",
        chart: {
            height: 170,
            type: "bar",
            options: {
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
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    boxWidth: 20,
                    fontSize: 10
                  }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: false,
                            labelString: "Social Grade / UK"
                        },
                        ticks: {
                          maxRotation: 0,
                          minRotation: 0
                        }
                    }],
                    yAxes: [{
                            scaleLabel: {
                                display: false,
                                labelString: "Site"
                            },
                            id: "left",
                            ticks: {
                              stepSize: 50,
                              beginAtZero: true
                            }
                        },
                        {
                            scaleLabel: {
                                display: false,
                                labelString: "Index"
                            },
                            id: "right",
                            position: "right",
                            ticks: {
                              stepSize: 0.1,
                              beginAtZero: true
                            }
                        }
                    ]
                },
            }
        }
    }
    xyz.dataviews.create(entry)

}

function disposable_income(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        type: "dataview",
        name: "Disposable Income",
        title: "Disposable Income",
        target: document.getElementById("xyz_disposable_income"),
        query: "uk_pipelines_disposable_income",
        chart: {
            height: 170,
            type: "horizontalBar",
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
                }
            }
        }
    }

    xyz.dataviews.create(entry)
}

function home_ownership(xyz, params) {
    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        type: "dataview",
        name: "Home Ownership",
        title: "Home Ownership",
        target: document.getElementById("xyz_home_ownership"),
        query: "uk_pipelines_home_ownership",
        chart: {
            height: 170,
            type: "horizontalBar",
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
                }
            }
        }
    }
    xyz.dataviews.create(entry)
}

function age_profile(xyz, params) {
  let entry = {
    locale: params.locale,
    layer: params.layer,
    table: xyz.layers.list[params.layer].table,
    location: params.location,
    id: params.id,
    type: "dataview",
        name: "Age Profile",
        title: "Age Profile",
        target: document.getElementById("xyz_age_profile"),
        query: "uk_pipelines_age_profile",
        chart: {
            height: 170,
            type: "bar",
            options: {
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
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    boxWidth: 20,
                    fontSize: 10
                  }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: false,
                            labelString: "Age Profile"
                        },
                        ticks: {
                          maxRotation: 0,
                          minRotation: 0
                        }
                    }],
                    yAxes: [{
                            scaleLabel: {
                                display: false,
                                labelString: "Site"
                            },
                            id: "left",
                            ticks: {
                              stepSize: 100,
                              beginAtZero: true
                            }
                        },
                        {
                            scaleLabel: {
                                display: false,
                                labelString: "Index"
                            },
                            id: "right",
                            position: "right",
                            ticks: {
                              stepSize: 0.05,
                              beginAtZero: true
                            }
                        }
                    ]
                },
            }
        }
    }
    xyz.dataviews.create(entry)
}

function oac_profile(xyz, params) {

    let entry = {
    locale: params.locale,
    layer: params.layer,
    table: xyz.layers.list[params.layer].table,
    location: params.location,
    id: params.id,
    type: "dataview",
        name: "OAC Profile",
        title: "OAC Profile",
        target: document.getElementById("xyz_oac_profile"),
        query: "uk_pipelines_oac_profile",
        chart: {
            height: 170,
            type: "bar",
            options: {
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
                legend: {
                  display: false,
                  position: "bottom",
                  labels: {
                    boxWidth: 20,
                    fontSize: 10
                  }
                },
                tooltips: {
                    callbacks: {
                        label: (item, data) => {
                            return `${item.xLabel}: ${item.yLabel + 100}`
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: false,
                            labelString: "OAC Profile"
                        },
                        ticks: {
                          maxRotation: 0,
                          minRotation: 0
                        }
                    }],
                    yAxes: [{
                            scaleLabel: {
                                display: false,
                                labelString: "Site"
                            },
                            ticks: {
                              stepSize: 100,
                              beginAtZero: true,
                              callback: (value, index, values) => {
                                return value + 100;
                              }
                            }
                        }
                    ]
                },
            }
        }
    }
    xyz.dataviews.create(entry)
}

function customer_profile(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        target: document.getElementById("xyz_customer_profile"),
        query: 'uk_pipelines_customer_profile',
        type: "dataview",
        autoColumns: true,
        headerSort: false,
        layout: "fitColumns",
        columns: []
    }
    xyz.dataviews.create(entry)
}


