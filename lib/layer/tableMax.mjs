export default function tableMax() {

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table

  // Return first value from (reversed) tables object which is not null.
  return Object.values(layer.tables).reverse().find(val => !!val)
}