/**
## mapp.utils.dateTime

The dateTime utils module exports the dateTime object with method to transform between unix date[time] integer and string values.

@module /utils/dateTime
*/

export const dateTime = {
  dateString,
  dateToUnixEpoch,
  datetime,
  date
};

/**
@function dateString
@description
Entries of type date/datetime are stored as unix epoch. 
This function extracts Date string from date/datetime entry integer value and returns it
formatted according to local options passed inside entry.
Default locale is set to `en-GB`.
For more information on date/datetime formatting options see [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) 
@param {infoj-entry} entry type:date or type:datetime infoj-entry typedef object.
@property {integer} entry.value date[time] as unix epoch.
@property {integer} [entry.newValue] updated entry.value which has not yet been saved.
@returns {String} date with local format
**/
function dateString(entry) {
  entry.locale ??= 'en-GB'
  const date = new Date((entry.newValue || entry.value) * 1000);
  const displayDate = new Intl.DateTimeFormat(entry.locale, entry.options).format(date)
  return displayDate
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
and formats it into a date string supported by input element of type date for editable datetime entries.
Format read by date and time inputs is fixed as `YYYY-MM-DDT00:00`.
This is achieved by toISODate date method with removal of time zone part separated by '.'
@param {infoj-entry} entry type:datetime infoj-entry typedef object.
@returns {String}
*/
function datetime(entry) {
  const date = new Date((entry.newValue || entry.value) * 1000);
  const displayDate = date.toISOString().split('.')[0]
  return displayDate
}

/**
@function date
@description
This function takes a date entry value i.e. unix epoch 
and formats it into a date string read by input element of type date for editable date entries.
Format read by date inputs is fixed as `YYYY-MM-DD`.
This is achieved by toISODate date method with removal of time part separated by 'T'
@param {infoj-entry} entry type:date infoj-entry typedef object.
@returns {String}
*/
function date(entry) {
  const date = new Date((entry.newValue || entry.value) * 1000);
  const displayDate = date.toISOString().split('T')[0]
  return displayDate
}
