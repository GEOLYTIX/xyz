// Load workspace into memory.
module.exports = async workspace => {

  // Assign admin level workspace.
  global.workspace.admin.config = workspace;
  await createLookup(global.workspace.admin);
  
};
  
function createLookup(workspace) {
  
  // store all workspace string values in lookup arrays.
  workspace.values = ['', 'geom', 'geom_3857', 'id', 'ST_asGeoJson(geom)', 'ST_asGeoJson(geom_4326)'];
  (function objectEval(o) {
    Object.keys(o).forEach((key) => {
      if (typeof key === 'string') workspace.values.push(key);
      if (typeof o[key] === 'string') workspace.values.push(o[key]);
      if (o[key] && typeof o[key] === 'object') objectEval(o[key]);
    });
  })(workspace.config);
  
}