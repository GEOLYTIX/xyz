module.exports = async infoj => {
    
  let fields = '';
    
  await infoj.forEach(entry => {
        
    if (!entry.field) return;
        
    if (fields.length > 0) fields += ', ';
        
    // if (entry.type === 'integer') return fields += `${entry.field} = ${entry.newValue},`;
        
    if (entry.type === 'date') return fields += `${entry.field} = ${entry.newValue}`;
        
    fields += `${entry.field} = '${entry.newValue.replace(/'/g, '\'\'')}'`;
  });
    
  return fields;
};