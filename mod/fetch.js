/**
@module /fetch
*/

export default async (req, res) => {
  if (!req.options?.template) {
    res.status(400).send();
    return;
  }

  const template = req.options.template;

  if (typeof template.options.body !== 'string') {
    template.options.body = JSON.stringify(template.options.body);
  }

  const response = await fetch(template.resource, template.options);

  const data = await response.json();

  res.send(data);
};
