const { join } = require('path')

module.exports = async (req, res) => {

  const mod = req.params.workspace.modules[req.params.module];

  if (!mod) return;

  if (!mod.mod) {

    mod.mod = await import(join(__dirname, `../${mod.src}`));
  }

  const response = await mod.mod.default(req);
  
  res.send(response)
}