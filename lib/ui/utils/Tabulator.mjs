let Tabulator = null

async function dynamicImport() {

  if (window.Tabulator) {

    Tabulator = window.Tabulator

    return;
  }

  const mod = await import('https://cdn.skypack.dev/-/tabulator-tables@v5.2.7-uFL2B6RLQMMWIcn9QymG/dist=es2019,mode=imports/optimized/tabulator-tables.js')

  Tabulator = mod.TabulatorFull
}

export default async function() {

  if (!Tabulator) await dynamicImport()

  return new Tabulator(...arguments);
}