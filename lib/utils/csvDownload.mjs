/**
## mapp.utils.csvDownload()

@module /utils/csvDownload
*/

export default function csvDownload(data, params = {}) {

  if (!Array.isArray(data)) {
    console.warn('Array argument for csvDownload must be an array')
    return;
  }

  // Set comma as default separator.
  params.separator ??= ','

  const rows = data.map(record => {

    const row = Array.isArray(params.fields)
     ? fieldsFunction(record, params.fields)
     : Object.values(record)
     
    return row.join(params.separator)
  })

  // Set default type for the blob.
  params.type ??= 'text/csv;charset=utf-8;'

  params.join ??= '\r\n'

  params.title ??= 'file'

  if (params.header && Array.isArray(params.fields)) {

    // Unshift the header row with either the title or field names.
    rows.unshift(params.fields.map(field => field.title || field.field))
  }

  const blob = new Blob([rows.join(params.join)], { type: params.type })

  const link = document.createElement('a')

  link.download = `${params.title}.csv`
  link.href = URL.createObjectURL(blob)
  link.dataset.downloadurl = ['csv', link.download, link.href].join(':')
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
}

function fieldsFunction(record, fields) {

  return fields.map(field => {

    if (!field.field) return;

    // Escape quotes in string value.
    if (typeof record[field.field] === 'string' && field.string) {

      return `"${record[field.field].replaceAll('"', '""')}"`
    }

    // Format number toLocaleString
    if (field.formatter === 'toLocaleString') {

      const val = parseFloat(record[field.field])

      if (isNaN(val)) return;

      return `"${val.toLocaleString(field.locale || navigator.language, field.options)}"`
    }

    return record[field.field]

  })
}