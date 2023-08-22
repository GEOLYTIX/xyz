module.exports = async (req, res) => {

  const template = req.params.template

  if (typeof template.params.body !== 'string') {

    template.params.body = JSON.stringify(template.params.body)
  }

  const response = await fetch(template.url, template.params);

  const data = await response.json()

  res.send(data)
}