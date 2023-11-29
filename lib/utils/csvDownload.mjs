export default function csvDownload(data, params = {}) {

  if (!Array.isArray(data)) {
    console.warn('Array argument for csvDownload must be an array')
    return;
  }

  // Set comma as default separator.
  params.separator ??= ','

  const rows = data.map(record => {

    if (Array.isArray(params.fields)) {

      let row = params.fields.map(field => {

        if (!field.field) return;

        // Escape quotes in string value.
        if (typeof record[field.field] === 'string' && field.string) {

          return `"${record[field.field].replace(`"`, `\\"`)}"`
        }

        // Format number toLocaleString
        if (field.formatter === 'toLocaleString') {

          let val = parseFloat(record[field.field])

          if (isNaN(val)) return;
      
          return `"${val.toLocaleString(field.locale || navigator.language, field.options)}"`
        }

        return record[field.field]

      })

      return row.join(params.separator)
    }

    return Object.values(record).join(params.separator)
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