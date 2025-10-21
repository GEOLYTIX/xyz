export default function distributedTheme(layer) {
    console.log(layer.style.theme.categories)
    layer.L.once('postrender', ()=>{
        distributedTheme(layer)
    })
}