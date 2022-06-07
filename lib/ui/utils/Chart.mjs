let Chart = null

async function dynamicImport() {

  if (window.Chart) {

    Chart = window.Chart

    return;
  }

  const mod = await import('https://cdn.skypack.dev/chart.js@3.8.0')

  mod.Chart.register(...mod.registerables);

  const pluginDatalabels = await import(
    "https://cdn.skypack.dev/chartjs-plugin-datalabels@2.0.0"
  );

  mod.Chart.register(pluginDatalabels.default);

  const pluginAnnotation = await import(
    "https://cdn.skypack.dev/chartjs-plugin-annotation@1.4.0"
  );

  mod.Chart.register(pluginAnnotation.default);

  Chart = mod.Chart

}

export default async function(canvas, options) {

  if (!Chart) await dynamicImport()

  return new Chart(canvas, options);
}