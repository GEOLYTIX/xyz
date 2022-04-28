export default async (_this) => {
  const canvas = _this.target.appendChild(mapp.utils.html.node`<canvas>`);
  _this.ChartJS = await mapp.ui.utils.Chart(canvas, mapp.utils.merge({
    type: "bar",
    options: {
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          display: false
        }
      }
    }
  }, _this.chart));
  _this.setData = (data) => {
    if (_this.noDataMask && !data) {
      _this.target.style.display = "none";
      _this.mask = !_this.mask && _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`);
    } else {
      _this.mask && _this.mask.remove();
      delete _this.mask;
      _this.target.style.display = "block";
    }
    if (!data) {
      data = {
        datasets: [
          {
            data: []
          }
        ]
      };
    }
    if (!data.datasets) {
      data = {
        datasets: [
          {
            data
          }
        ]
      };
    }
    _this.data = data;
    _this.chart.datasets?.length && data.datasets.forEach((dataset, i) => Object.assign(dataset, _this.chart.datasets[i]));
    data.labels = data.labels || _this.chart.labels;
    _this.ChartJS.data = data;
    _this.ChartJS.update();
  };
};
