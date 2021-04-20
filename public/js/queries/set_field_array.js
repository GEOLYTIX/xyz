module.exports = {
  render: _ => {

    const layer = _.workspace.locales[_.locale].layers[_.layer]

    return `
    UPDATE \${table}
    SET \${field} = array_\${action}(\${field}, %{secure_url})
    WHERE ${layer.qID} = %{id};`

  }
}