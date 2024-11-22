/**
## mapp.utils.temporal

The temporal utils module exports the temporal object with method to transform between unix date[time] integer and string values.

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
@description
Entries of type date are stored as unix epoch. 
This function extracts Date string from date entry integer value and returns it
formatted according to local options passed inside entry.

@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@property {integer} entry.value date[time] as unix epoch.
@property {integer} [entry.newValue] updated entry.value which has not yet been saved.
@returns {String} date with local format
**/
function dateString(entry) {
  return new Date((entry.newValue || entry.value) * 1000)
    .toLocaleDateString(entry.locale, entry.options)
}

/**
@function timeString
@description
Extracts time string from unix epoch. Value is included in the final output of datetime entry formatter. 
Returns time only as 00:00.

@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@property {integer} entry.value date[time] as unix epoch.
@property {integer} [entry.newValue] updated entry.value which has not yet been saved.
@returns {String}
*/
function timeString(entry) {
  return new Date((entry.newValue || entry.value) * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
@function dateToUnixEpoch
@description
Takes a Date string and converts it to a big integer representing time stamp as unix epoch.

If no value passed the function returns unix epoch from current timestamp.

@param {String} [dateStr] type:String string which can be cast to JavaScript Date object.
@returns {Number} big integer
*/
function dateToUnixEpoch(dateStr) {
  if (!dateStr) {
    return Math.floor(new Date().getTime() / 1000)
  }

  return Math.floor(new Date(dateStr).getTime() / 1000)
}

/**
@function datetime
@description
This function takes a datetime entry value i.e. unix epoch 
and formats it into a date string read by input element of type date for editable datetime entries.
Format read by date and time inputs is fixed as `YYYY-MM-DDT00:00`.

@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@returns {String}
*/
function datetime(entry) {
  return `${new Date((entry.newValue || entry.value) * 1000).toLocaleDateString('fr-CA')}T${timeString(entry)}`
}

/**
@function date
@description
This function takes a date entry value i.e. unix epoch 
and formats it into a date string read by input element of type date for editable date entries.
Format read by date inputs is fixed as `YYYY-MM-DD` which is formatted by `fr-CA` options.
@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@returns {String}
*/
function date(entry) {
  return `${new Date((entry.newValue || entry.value) * 1000).toLocaleDateString('fr-CA')}`
}
