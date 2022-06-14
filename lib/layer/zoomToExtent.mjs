export default function zoomToExtent() {
  
  let response = await mapp.utils.xhr(`${this.mapview.host}/api/query/layer_extent?`+
    mapp.utils.paramString({
      dbs: this.dbs,
      locale: this.mapview.locale.key,
      layer: this.key,
      table: this.table || Object.values(this.tables)[0] || Object.values(this.tables)[1],
      geom: this.geom,
      proj: this.srid,
      srid: this.mapview.srid,
      filter: this.filter.current
    }))

  const bounds = /\((.*?)\)/.exec(response.box2d)[1].replace(/ /g, ',')

  this.mapview
    .fitView(bounds.split(',')
    .map(coords => parseFloat(coords)), params)

}