export default function distributedTheme(layer) {
    console.log(layer.style.theme.categories)
    layer.L.once('postrender', ()=>{
        distributedTheme(layer)

    for (const key of Object.keys(theme.lookup || {})) {
      const cat = theme.lookup[key];
      cat.value = key;
      cat.label = key;

      legendHelper.createLegend(cat, theme, layer);
    }
  });
}