export default function csvDownload(arr, params = {}) {

    if (!Array.isArray(arr)) {
        console.warn('Array argument for csvDownload must be an array')
        return;
    }

    const rows = arr.map(record => {

        return Object.values(record).join(',')
    })

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')

    link.download = `${params.title || 'file'}.csv`
    link.href = URL.createObjectURL(blob)
    link.dataset.downloadurl = ['csv', link.download, link.href].join(':')
    link.style.display = "none"
    document.body.append(link)
    link.click()
    link.remove()
}