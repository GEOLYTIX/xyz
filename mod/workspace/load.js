// Load workspace into memory.
module.exports = async workspace => {

  // Assign admin level workspace.
  global.workspace.admin.config = workspace;
  
  await createLookup(global.workspace.admin);
  
  // Assign private workspace.
  global.workspace.private.config = await removeAccess('admin');
  await createLookup(global.workspace.private);
  
  // Assign public workspacee.
  global.workspace.public.config = await removeAccess('private');
  await createLookup(global.workspace.public);
  
};
  
function removeAccess(access) {
  
  // deep clone the access level workspace.
  let config = JSON.parse(JSON.stringify(global.workspace[access].config));
  
  (function objectEval(o, parent, key) {
  
    // check whether the object has an access key matching the current level.
    if (Object.entries(o).some(e => e[0] === 'access' && e[1] === access)) {
  
      // if the parent is an array splice the key index.
      if (parent.length > 0) return parent.splice(parseInt(key), 1);
  
      // if the parent is an object delete the key from the parent.
      return delete parent[key];
    }
  
    // iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key);
    });
  
  })(config);
  
  return config;
}
  
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