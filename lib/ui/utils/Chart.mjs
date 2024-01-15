let promise, Chart = null

mapp.utils.merge(mapp.dictionaries, {
  en: {
    fail_chartjs_load: 'Failed to load Chart.js library. Please reload the browser.',
  },
  de: {
    fail_chartjs_load: 'Laden des Chart.js Modules fehlgeschlagen.',
  },
  zh: {
    fail_chartjs_load: '无法加载 Chart.js 库。 请重新加载浏览器。',
  },
  'zh_tw': {
    fail_chartjs_load: '無法載入 Chart.js 庫。 請重新載入流覽器。',
  },
  pl: {
    fail_chartjs_load: 'Nie udało się załadować biblioteki Chart.js. Otwórz ponownie przeglądarkę.',
  },
  fr: {
    fail_chartjs_load: 'Erreur de chargement de la librairie Chart.js. Veuillez actualiser la page.',
  },
  ja: {
    fail_chartjs_load: 'Chart.jsライブラリはロードに失敗しました。ブラウザをリロードしてください.',
  },
  es: {
    fail_chartjs_load: 'No se pudo cargar la biblioteca Chart.js. Por favor actualice la página.',
  },
  tr: {
    fail_chartjs_load: 'Chart.js kutuphanesi yuklenemedi. Lutfen sayfayi yenileyiniz.',
  },
  it: {
    fail_chartjs_load: 'Errore nel caricare la libreria Chart.js. Per favore ricarica il browser',
  }
})

async function chart(canvas, options) {

  // Assign promise to load ChartJS library if null.
  promise ??= new Promise(resolve => {

    // Assign from window if Chart library is loaded from link
    if (window.Chart) {

      Chart = window.Chart

      resolve()

      return
    }

    // Import Chart and plugins.
    Promise
      .all([
        import('https://cdn.jsdelivr.net/npm/chart.js/+esm'),
        import('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels/+esm'),
        import('https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation/+esm')

      ])
      .then(imports => {

        // Register imports
        imports[0].Chart.register(...imports[0].registerables);

        imports[0].Chart.register(imports[1].default);

        imports[0].Chart.register(imports[2].default);

        Chart = imports[0].Chart

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert(`${mapp.dictionary.fail_chartjs_load}`)
      })

  })

  // Await promise to load chart library.
  await promise

  // Return ChartJS creator method.
  return new Chart(canvas, options);
}

export default async function (_this) {

  // Charts most be rendered into a canvas type element.
  const canvas = _this.target.appendChild(mapp.utils.html.node`<canvas>`);

  // Await initialisation of ChartJS object.
  _this.ChartJS = await chart(
    canvas,
    mapp.utils.merge(
      {
        type: 'bar',
        options: {
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              display: false,
            },
          },
        },
      },
      _this.chart
    )
  );

  // Set chart data
  _this.setData = (data) => {

    // data is falsy
    if (_this.noDataMask && !data) {

      _this.noDataMask = typeof _this.noDataMask === 'string' ? _this.noDataMask : 'No Data';

      // Remove display from target
      _this.target.style.display = 'none';

      // Create _this.mask if undefined.
      _this.mask ??= mapp.utils.html.node`<div class="dataview-mask">${_this.noDataMask}`

      // Append _this.mask to the target parent.
      _this.target.parentElement?.append(_this.mask)

    } else {

      // Remove _this.mask from dom.
      _this.mask?.remove();

      // Set dataview target to display as block.
      _this.target.style.display = 'block';
    }

    // Create a dataset with empty data array if data is undefined.
    data ??= { datasets: [{ data: [] }] };

    // Set data in datasets array if no datasets are defined in data.
    data.datasets ??= [{ data }]

    _this.data = data;

    // Assign datasets from chart object to data.datasets.
    _this.chart.datasets?.length && data.datasets.forEach((dataset, i) =>
      Object.assign(dataset, _this.chart.datasets[i]));

    // Assign data.labels from chart if nullish.
    data.labels ??= _this.chart.labels;

    // Set data to chartjs object.
    _this.ChartJS.data = data;

    // Update the chartjs object.
    _this.ChartJS.update();

    // Execute setDataCallback method if defined as function.
    typeof _this.setDataCallback === 'function' && _this.setDataCallback(_this);
  };

  // Set _this.data if provided.
  _this.data && _this.setData(_this.data)
}