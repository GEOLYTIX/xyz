document.dispatchEvent(new CustomEvent('rri_chart', {detail: draw}));

function draw(_xyz){

	_xyz.locations.plugins.retail_places_rri_chart = entry => {

		const chart = {
      title: 'Retail Recovery Index',
      id: entry.location.id,
      location: entry.location,
      query: 'uk_retail_places_rri_chart',
      chart: {
        type: 'line',
        options: {
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Retail Recovery Index'
              },
              ticks: {
                stepSize: 0.1
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
          legend: {
            display: true,
            align: 'end'
          },
          plugins: {
            datalabels: {
              display: false
            }
          },
          annotation: {
            annotations: [
            {
              drawTime: "afterDatasetsDraw",
              type: "line",
              mode: "vertical",
                scaleID: "x-axis-0",
                value: 2.2,
                borderColor: "rgba(0, 0, 0, 0.8)",
                borderDash: [4, 4],
                borderDashOffset: 5,
                borderWidth: 1,
                label: {
                  backgroundColor: "rgba(69,90,100,0.6)",
                    content: "Lockdown",
                    enabled: true,
                    fontSize: 10
                  }
            },
            {
              drawTime: "afterDatasetsDraw",
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              value: 9.7,
              borderColor: "rgba(0, 0, 0, 0.8)",
              borderDash: [4, 4],
                borderDashOffset: 5,
              borderWidth: 1,
              label: {
                backgroundColor: "rgba(69,90,100,0.6)",
                content: "Some measures lifted",
                enabled: true,
                fontSize: 10
              }
            },
            {
              drawTime: "afterDatasetsDraw",
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              value: 14.3,
              borderColor: "rgba(0, 0, 0, 0.8)",
              borderDash: [4, 4],
                borderDashOffset: 5,
              borderWidth: 1,
              label: {
                backgroundColor: "rgba(69,90,100,0.6)",
                content: "Retail opens",
                enabled: true,
                fontSize: 10
              }
            }
          ]
        }
        }
      }
    }

    _xyz.dataviews.create(chart);

    entry.listview.appendChild(_xyz.locations.view.dataview(chart));
	
	}

}