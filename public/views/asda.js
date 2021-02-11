const params = {}

// Take hooks from URL and store as current hooks.
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
    params[key] = decodeURI(value)
})



window.onload = () => {
    _xyz({
        host: '/asda',
        locale: params.locale,
        callback: xyz => callback(xyz)
    })
}

function callback(xyz) {

    xyz.mapview.create({
        target: document.getElementById('map'),
        scrollWheelZoom: true
    })

    xyz.layers.load(["Mapbox Base", "Grocery", params.layer]).then(layers => {
        layers.forEach(layer => layer.show())
        xyz.locations.select({
            locale: params.locale,
            layer: params.layer,
            table: xyz.layers.list[params.layer].table,
            id: params.id,
            callback: location => {

                xyz.locations.decorate(location);

                location.infoj = location.infoj.filter(entry => entry.type !== 'streetview' && entry.type !== 'key' && entry.type !== 'report' && !(entry.type === 'title' && !entry.class))

                location.infoj.map(entry => { return entry.edit = false })

                xyz.locations.view.create(location)

                location.draw()

                location.flyTo()

                location.layer.show()

                document.getElementById('xyz_location') && document.getElementById('xyz_location').appendChild(xyz.locations.view.infoj(location))

                //document.querySelectorAll('.xyz_site_name').forEach(s => s.textContent = site_name.value)

                //document.querySelectorAll('.area_leader').forEach(s => s.textContent = `, ${area_leader.manager_name}`)

                document.querySelectorAll('.current_date').forEach(s => s.textContent = current_date())

                demand_chart(xyz, Object.assign(params, { location: location }))
                retailers(xyz, Object.assign(params, { location: location }))
                population_score(xyz, Object.assign(params, { location: location }))
                population_change(xyz, Object.assign(params, { location: location }))
                testTable(xyz, Object.assign(params, { location: location }))
            }
        })
    })
}


function current_date() {

    let current_date = new Date()

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return `${current_date.getDate()} ${months[current_date.getMonth()]} ${current_date.getFullYear()}`
}

function demand_chart(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        plugin: "demand_chart",
        query: "uk_sites_demand",
        target: document.getElementById("demand_chart"),
        chart: {
            height: 120,
            type: 'line',
            options: {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Demand (£100,000)'
                        },
                        ticks: {
                            stepSize: 100
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            maxRotation: 90,
                            minRotation: 90
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Week start date',
                            padding: 20
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    intersect: true,
                    position: 'average',
                    displayColors: false,
                    callbacks: {
                        label: function(tooltipItem, data) {

                            let label = data.datasets[tooltipItem.datasetIndex].label,
                                online = data.datasets[1].data,
                                instore = data.datasets[0].data,
                                idx = data.labels.indexOf(tooltipItem.xLabel),
                                pct = Math.round(online[idx] * 1000 / (instore[idx] + online[idx]), 1) / 10

                            return [
                                `InStore ${instore[idx].toLocaleString()} (£100,000)`,
                                `Online ${online[idx].toLocaleString()} (£100,000)`,
                                `Online ${pct}%`
                            ]
                        }
                    }
                },
                legend: {
                    display: true,
                    align: 'end'
                },
                plugins: {
                    datalabels: {
                        display: false
                    }
                }
            }
        }
    }
    xyz.dataviews.create(entry)
}

function retailers(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        query: "uk_sites_retailers_chart",
        target: document.getElementById("retailers"),
        chart: {
            height: 100,
            type: 'horizontalBar',
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            display: false
                        }
                    }]
                },
                legend: {
                    display: false,
                    align: 'end'
                },
                layout: {
                    padding: {
                        top: 10,
                        left: 10,
                        right: 20
                    }
                },
                plugins: {
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'black'
                    }
                }
            }
        }
    }
    xyz.dataviews.create(entry)
}

function population_score(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        query: "uk_sites_population_score_chart",
        target: document.getElementById("population_score"),
        chart: {
            height: 300,
            type: 'horizontalBar',
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            display: false
                        }
                    }]
                },
                legend: {
                    display: false,
                    align: 'end'
                },
                layout: {
                    padding: {
                        top: 20,
                        left: 10,
                        right: 20
                    }
                },
                tooltips: {
                    callbacks: {
                        label: (item, data) => {
                            return `${item.yLabel}: ${item.xLabel + 100}`
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        display: false,
                        anchor: 'end',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'black'
                    }
                }
            }
        }
    }
    xyz.dataviews.create(entry)
}

function population_change(xyz, params) {

    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        query: "uk_sites_population_15min_chart",
        target: document.getElementById("population_change"),
        chart: {
            height: 280,
            type: 'bar',
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            display: true
                        }
                    }]
                },
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    boxWidth: 20,
                    fontSize: 10
                  }
                },
                layout: {
                    padding: {
                        top: 20,
                        left: 10,
                        right: 20
                    }
                },
                plugins: {
                    datalabels: {
                        display: false,
                        anchor: 'end',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'black'
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        scaleLabel: {
                            display: false,
                            labelString: "% vs UK"
                        },
                        ticks: {
                          maxRotation: 90,
                          minRotation: 90
                        }
                    }],
                    yAxes: [{
                            scaleLabel: {
                                display: false,
                                labelString: "Site"
                            },
                            id: "left",
                            ticks: {
                                stepSize: 0.1,
                                beginAtZero: true
                            }
                        },
                        {
                            scaleLabel: {
                                display: false,
                                labelString: "UK"
                            },
                            id: "right",
                            position: "right",
                            ticks: {
                                stepSize: 10000,
                                beginAtZero: true,
                                callback: (label, index, labels) => {
                                    return label/1000+'k'
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
    xyz.dataviews.create(entry)
}


function testTable(xyz, params){
    let entry = {
        locale: params.locale,
        layer: params.layer,
        table: xyz.layers.list[params.layer].table,
        location: params.location,
        id: params.id,
        query: "test",
        headerSort: false,
        target: document.getElementById("testTable"),
        columns: [
        {
            title: '<div class="xyz-icon icon-car" style="width: 24px; height: 24px;"></div>',
            field: "column1",
            height: 50
        },
        {
            title: '<div style="background-color: red;">Hello</div>',
            field: "column2"
        }
        ],
        _autoColumns: true
    }

    xyz.dataviews.create(entry)
}


