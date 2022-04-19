let Tabulator = null

async function dynamicImport() {

  if (window.Tabulator) {

    Tabulator = window.Tabulator

    return;
  }

  const mod = await import('https://cdn.skypack.dev/pin/tabulator-tables@v5.0.10-xDu7yyLVhsxCKJbN5vfH/mode=imports/optimized/tabulator-tables.js')

  Tabulator = mod.TabulatorFull
}

export default async function() {

  if (!Tabulator) await dynamicImport()

  return new Tabulator(...arguments);
}