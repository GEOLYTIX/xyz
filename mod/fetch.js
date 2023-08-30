module.exports = async (req, res) => {

  const template = req.options.template

  if (typeof template.options.body !== 'string') {

    template.options.body = JSON.stringify(template.options.body)
  }

  const response = await fetch(template.resource, template.options);

  const data = await response.json()

  res.send(data)
}