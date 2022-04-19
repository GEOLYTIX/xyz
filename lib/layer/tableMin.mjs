export default function tableMin() {

  // A layer must have either a table or tables configuration.
  if (!this.tables) return this.table

  // Return first value from tables object which is not null.
  return Object.values(layer.tables).find(val => !!val)
}