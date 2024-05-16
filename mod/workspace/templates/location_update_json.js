module.exports = _ => {

    let updateBody = {}
    Object.keys(_.body).forEach(field => {
        let values = []

        Object.keys(_.body[field]).forEach( key => {
            if(typeof _.body[field][key] !== 'string'){
                values.push(`"${key}":${_.body[field][key]}`)
            }
            else{
                values.push(`"${key}":"${_.body[field][key]}"`)
            }
        })

        updateBody[field] = `(${field}::jsonb || '{${values.join(',')}}'::jsonb)::json`
    })

    if(Object.keys(updateBody).length === 1){
        return `
            UPDATE ${_.table}
            SET ${Object.keys(updateBody).join(',')} = ${Object.values(updateBody).join(',')}
            WHERE ${_.layer.qID} = %{id};`    
    }

    return `
            UPDATE ${_.table}
            SET (${Object.keys(updateBody).join(',')}) = (${Object.values(updateBody).join(',')}) 
            WHERE ${_.layer.qID} = %{id};`
}