module.exports = _ => {

    let field = Object.keys(_.body)[0]

    let body = _.body[field]

    let values = []

    Object.keys(body).forEach( key => {
        if(typeof body[key] !== 'string'){
            values.push(`"${key}":${body[key]}`)
        }
        else{
            values.push(`"${key}":"${body[key]}"`)
        }
    })

    return `
            UPDATE ${_.table}
            SET ${field} = (${field}::jsonb || '{${values.join(',')}}'::jsonb)::json
            WHERE ${_.layer.qID} = %{id};`
}