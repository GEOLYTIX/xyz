/**
@module /utils/temporal
## mapp.utils.temporal{}

@module /utils/temporal
*/


export const temporal = {
  dateString,
  timeString,
  dateToUnixEpoch,
  datetime,
  date
};

/**
@function dateString
@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@returns {String} date with local format
@description
Entries of type date are stored as unix epoch. 
This function extracts Date string from date entry integer value and returns it
formatted according to local options passed inside entry.
**/
function dateString(entry) {
    return new Date((entry.newValue || entry.value) * 1000)
    .toLocaleDateString(entry.locale, entry.options)
}

/**
@function timeString
@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@returns {String}
@description
Extracts time string from unix epoch. Value is included in the final output of datetime entry formatter. 
Returns time only as 00:00.
*/
function timeString(entry) {
    return new Date((entry.newValue || entry.value) * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
@function dateToUnixEpoch
@param {String} dateStr type:String string which can be cast to JavaScript Date object.
@returns {Number} big integer
@description
Takes a Date string and converts it to a big integer representing time stamp as unix epoch
*/
function dateToUnixEpoch(entry) {
    return  Math.floor(new Date(dateStr).getTime() / 1000) 
}

/**
@function datetime
@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@returns {String}
@description
This function takes a datetime entry value i.e. unix epoch 
and formats it into a date string read by input element of type date for editable datetime entries.
Format read by date and time inputs is fixed as `YYYY-MM-DDT00:00`.
*/
function datetime(entry) {
    return `${new Date((entry.newValue || entry.value) * 1000).toLocaleDateString('fr-CA')}T${timeString(entry)}`
}

/**
@function date
@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@returns {String}
@description
This function takes a date entry value i.e. unix epoch 
and formats it into a date string read by input element of type date for editable date entries.
Format read by date inputs is fixed as `YYYY-MM-DD` which is formatted by `fr-CA` options.
*/
function date(entry) {
    return `${new Date((entry.newValue || entry.value) * 1000).toLocaleDateString('fr-CA')}`
}





