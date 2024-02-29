/**
## mapp.ui.elements.numericFormatter{}
The mapp.ui.elements.numericFormatter module provides methods to format numeric import using 
formatterParams supplied on the entries.

@module /ui/elements/numericFormatter
@description  module provides methods to format numeric import using formatterParams supplied on the entries.
*/

/**
 * Returns the decimal and thousand separators produced by toLocaleString or formatterParams 
 * @param {Object} entry - An infoj entry object.
 * @returns {Object} - An Object containing the two keys, thousands and decimals e.g `{ thousands: ',', decimals: '.'}`.
 */
export function getSeparators(entry){
    //Do nothing if entry is null or no formatter is present
    if(!entry) return;
    if(!entry.formatterParams) return;
    entry.prefix = '' 
    entry.suffix = ''
    //Use a number to determin what the fields 
    //formatted input would look like
    return getFormatterParams(entry,1000000.99).separators
}

function getFormatterParams(entry, inValue) {
    let value = inValue;
    entry.prefix ??= ''
    entry.suffix ??= ''

    if(entry.value){
        value = entry.value;
    }
    
    const negative = value[0] === '-'
    if(negative){
        value = value.substring(1,value.length)
    }
    let rawValue;
    //Check if supplied value is a valid number
    if(isNaN(parseFloat(value))){
        return {value: `${entry.prefix}   ${entry.suffix}`, separators:{thousands:'',decimals:''}}
    }
    
    //Framework formatter type
    if(entry.formatter === 'toLocaleString'){
        entry.formatterParams = entry.formatterParams ? {...{locale:entry.formatterParams.locale || navigator.language},...entry.formatterParams} : {locale:navigator.language}
    }

    //Tabulator formatterOptions
    if(entry.formatterParams?.decimal || entry.formatterParams?.thousand){
        rawValue = parseFloat(value)
        let rawList = rawValue.toLocaleString('en-GB', entry.formatterParams.options).split('.')
        rawList[0] = rawList[0].replaceAll(',',entry.formatterParams.thousand)
        rawValue = rawList.join(entry.formatterParams.decimal || '.')
        rawValue = entry.formatterParams.negativeSign ? `-${rawValue}` : rawValue
    }
    else{
        //Infoj formatter options
        rawValue = entry.formatterParams ? parseFloat(value).toLocaleString(entry.formatterParams.locale || navigator.language, entry.formatterParams.options) : parseFloat(value)
    }

    //Add The affixes
    let formattedValue = `${entry.prefix}${rawValue}${entry.suffix}`

    //Look for separators in formatterOptions
    let separators = [entry.formatterParams.thousand, entry.formatterParams.decimal]
    let localeSeparators = Array.from(new Set(formattedValue.match(/\D/g)))
    //If not supplied look in the formatted string
    separators[0] = separators[0] ? separators[0] : localeSeparators[0]
    separators[1] = separators[1] ? separators[1] : localeSeparators[1] || '.'

    formattedValue = `${negative ? '-' : ''}${formattedValue}`
    return {value: formattedValue, separators: {thousands: separators[0], decimals: separators[1]}}
}

function undoFormatting(entry,value){
    //Determine thousand and decimal markers
    const separators = getSeparators(entry)
    const negative = value[0] === '-'
    value = negative ? value.substring(1,value.length) : value 

    //Strip out thousand and decimal markers, replaceing decimal with '.'
    value = value.replaceAll(separators.thousands,'')
    if(separators.decimals){
        value = separators.decimals === '.' || separators.decimals === '' ? value : value.replace(separators.decimals,'.')
    }
    if(!Number(value)){ 
        value = value.replaceAll(/\D+/g,''); 
    }
    return `${negative ? '-' : ''}${value}`
}

/**
 * Returns the formatted string based on the provided formatterParams or locale
 * @param {Object} entry - An infoj entry object.
 * @param {Integer || String} inValue - The value to be formatted if not available in the entry.
 * @param {Boolean} reverse - A true false value specifying whether the formatting should be removed or applied.
 * @returns {Integer || String} - Either the fomatted string (`reverse=false`) or the numeric value(`reverse=true`). 
 */
export function numericFormatter(entry, inValue, reverse){
    //Do nothing if entry is null or no formatter is present
    if(!inValue && !entry.value) return;
    if(!entry) return entry.value || inValue;
    if(!entry.formatterParams) return entry.value || inValue;
    entry.prefix = '' 
    entry.suffix = ''
    //Do the opposite of formatting
    if(reverse){
        return undoFormatting(entry,inValue)
    }
    //Get the actual formatted value
    return getFormatterParams(entry,inValue).value
}

export default{
    numericFormatter,
    getSeparators
}