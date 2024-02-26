export default function numericFormatter(entry, inValue) {
    const value = entry.value || inValue
    if(isNaN(parseFloat(value))){
        return `${entry.prefix || ''}   ${entry.suffix || ''}`
    }
    const rawValue = entry.formatterParams ? parseFloat(value).toLocaleString(entry.formatterParams.locale || 'en-GB', entry.formatterParams.options) : parseFloat(value)
    const formattedValue = `${entry.prefix || ''}${rawValue}${entry.suffix || ''}`
    return formattedValue;
}
