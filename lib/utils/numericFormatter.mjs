/**
@module /utils/numericFormatter
*/

/**
@function numericFormatter

@description
Returns the formatted string based on the provided formatterParams.

@param {Object} params An infoj entry or compliant object.
@param {Boolean} entry.undo - removes formatting
Method returns numeric value if true.
@returns {string} Returns formatted string from numeric value without the numeric flag.
*/
export function numericFormatter(params) {
    
    // do nothing if no formatter
    if (!params.formatter) return params.value;
    
    // always add formatter params + default locale
    params.formatterParams ??= {
        locale: 'en-GB'
    };

    //Do the opposite of formatting
    if (params.undo) return undoFormatting(params)
    
    
    // Get the actual formatted value
    return getFormatterParams(params).value
  
}

function getFormatterParams(params) {

    let value = params.value;
    let prefix = params.prefix ??= '';
    let suffix = params.suffix ??= '';
    let round = params.round;
  
    if (params.filterInput) {
      prefix = ''
      suffix = ''
      round = null
    }
  
    if (!value && value !== 0) {
      return { value: null }
    }
  
    const negative = value[0] === '-'
  
    if (negative) {
      value = value.substring(1, value.length)
    }
  
    let rawValue;
  
    //Check if supplied value is a valid number
    if (isNaN(parseFloat(value))) {
      return { value: `${prefix}   ${suffix}`, separators: { thousands: '', decimals: '' } }
    }

    // always add formatter params + default locale
    params.formatterParams ??= {
        locale: 'en-GB'
    };
    //Setup formatter options for rounding
    params.formatterParams.options ??= {}
    params.formatterParams.options.maximumFractionDigits ??= params.formatterParams.precision ??= round
    params.formatterParams.options.minimumFractionDigits ??= params.formatterParams.precision ??= round
  
    //Tabulator formatterOptions
    if (params.formatterParams?.decimal || params.formatterParams?.thousand) {
  
      params.formatterParams.decimal ??= '.'
  
      rawValue = parseFloat(value)
  
      let rawList = rawValue.toLocaleString(params.formatterParams.locale, params.formatterParams.options).split('.')
  
      rawList[0] = rawList[0].replaceAll(',', params.formatterParams.thousand)
      rawValue = rawList.join(params.formatterParams.decimal)
  
    } else {
  
      //Infoj formatter options
      rawValue = parseFloat(value).toLocaleString(params.formatterParams.locale, params.formatterParams.options)
    }
  
    //Add The affixes
    let formattedValue = `${prefix}${rawValue}${suffix}`
  
    //Look for separators in formatterOptions.
    let separators = [params.formatterParams?.thousand, params.formatterParams?.decimal]
  
    let localeSeparators = Array.from(new Set(formattedValue.match(/\D/g)))
  
    localeSeparators[1] ??= '.'
  
    //If not supplied look in the formatted string
    separators[0] = separators[0] ? separators[0] : localeSeparators[0]
    separators[1] = separators[1] ? separators[1] : localeSeparators[1]
  
    formattedValue = `${negative ? '-' : ''}${formattedValue}`
  
    return {
      value: formattedValue,
      separators: {
        thousands: separators[0],
        decimals: separators[1]
      }
    }
}

function undoFormatting(params) {

    //Determine thousand and decimal markers
    let value = params.value
  
    if (!params.value) return null;
  
    const separators = getSeparators(params)
  
    const negative = value[0] === '-'
  
    value = negative ? value.substring(1, value.length) : value
  
    //Strip out thousand and decimal markers, replacing decimal with '.'
    value = value.replaceAll(separators.thousands, '')
  
    if (separators.decimals) {
      value = separators.decimals === '.' || separators.decimals === '' ? value : value.replace(separators.decimals, '.')
    }
  
    if (!Number(value)) {
      value = value.replaceAll(/\D+/g, '');
    }
  
    return `${negative ? '-' : ''}${value}`
}

export function getSeparators(params) {
  
    //Do nothing if entry is null or no formatter is present
    if (!params) return;
  
    if (!params.formatter && params?.type !== 'integer') return { decimals: '.' };
  
    //Use a number to determine what the fields 
    //formatted input would look like
    params.value = 1000000.99
  
    return getFormatterParams(params).separators
}