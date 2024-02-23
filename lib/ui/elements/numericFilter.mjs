export default function getVal(entry, value) {
    if(isNaN(parseFloat(value))){
        return `${entry.prefix || ''}   ${entry.suffix || ''}`
    }
    const formattedValue = `${entry.prefix || ''}${parseFloat(value).toLocaleString(entry.formatterParams.locale || 'en-US', entry.formatterParams.options)}${entry.suffix || ''}`
    return formattedValue;
}
