export function getSeparators(entry){
    if(!entry.formatterParams) return;
    //Use a number to determin what the fields 
    //formatted input would look like
    return getFormatterParams(entry,1000000.99).separators
}

function getFormatterParams(entry, inValue) {
    const value = entry.value || inValue
    let rawValue;
    if(isNaN(parseFloat(value))){
        return {value: `${entry.prefix || ''}   ${entry.suffix || ''}`, separators:{thousands:'',decimals:''}}
    }
    
    if(entry.formatter === 'toLocaleString'){
        entry.formatterParams = entry.formatterParams ? {...{locale:entry.formatterParams.locale || navigator.language},...entry.formatterParams} : {locale:navigator.language}
    }

    if(entry.formatterParams?.decimal || entry.formatterParams?.thousand){
        rawValue = parseFloat(value)
        let rawList = rawValue.toLocaleString('en-GB', entry.formatterParams.options).split('.')
        rawList[0] = rawList[0].replaceAll(',',entry.formatterParams.thousand)
        rawValue = rawList.join(entry.formatterParams.decimal || '.')
        rawValue = entry.formatterParams.negativeSign ? `-${rawValue}` : rawValue
    }
    else{
        rawValue = entry.formatterParams ? parseFloat(value).toLocaleString(entry.formatterParams.locale || navigator.language, entry.formatterParams.options) : parseFloat(value)
    }

    const formattedValue = `${entry.prefix || ''}${rawValue}${entry.suffix || ''}`
    let separators = [entry.formatterParams.thousand, entry.formatterParams.decimal]
    separators[0] = separators[0] ? separators[0] : Array.from(new Set(formattedValue.match(/\D/g)))[0]
    separators[1] = separators[1] ? separators[1] : Array.from(new Set(formattedValue.match(/\D/g)))[1] || '.'
    return {value: formattedValue, separators: {thousands: separators[0], decimals: separators[1]}}
}

function undoFormatting(entry,value){
    //Determine thousand and decimal markers
    const separators = getSeparators(entry)

    //Strip out thousand and decimal markers
    value = value.replaceAll(separators.thousands,'')
    if(separators.decimals){
        value = separators.decimals === '.' || separators.decimals === '' ? value : value.replace(separators.decimals,'.')
    }
    if(!Number(value)){ 
        value = value.replaceAll(/\D+/g,''); 
    }
    return value
}

export function numericFormatter(entry, inValue, reverse){
    if(!entry.formatterParams) return entry.value || inValue;
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