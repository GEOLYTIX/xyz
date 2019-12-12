module.exports = async infoj => {
    
  let fields = '';
    
  await infoj.forEach(entry => {
        
    if (!entry.field) return;
        
    if (fields.length > 0) fields += ', ';
        
    if (entry.type === 'integer') {
      let parsed = parseInt(entry.newValue);
      return fields += `${entry.field} = ${ parsed || parsed === 0 ? parsed : null }`;
    }
        
    if (entry.type === 'date' || entry.type === 'datetime') return fields += `${entry.field} = ${entry.newValue}`;

    if (entry.type === 'boolean') return fields += `${entry.field} = ${entry.newValue}`;
        
    fields += `${entry.field} = '${entry.newValue.replace(/'/g, '\'\'')}'`;
  });
    
  return fields;
};