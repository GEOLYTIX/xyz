/**
## /utils/csvDownload

The csvDownload module exports a default method to turn an array into a comma separated text file.

@module /utils/csvDownload
*/

/**
@function csvDownload

@description
The function turns an array of records into a text blob. The blob is transfomed to an ObjectURL which can be referenced in an anchor [link] tag. The hidden tag element is appended to the document.body and programmatically clicked to download the ObjectURL as a text file.

@param {array} data An array of records for the csv text file.
@param {Object} [params] The parameters object.
@property {String} [params.separator=','] The seperator used in the csv text file.
@property {String} [params.type='text/csv;charset=utf-8;'] The type for the csv text file includes the charset required for character support.
@property {String} [params.join='\r\n'] The characters used to join the row strings. The default being [carriage] return \r and [new] line feed \n.
@property {String} [params.file='file'] The file name for the download generated from clicking the ObjectURL link.
@property {Boolean} [params.header] Whether a header should be added to the CSV file.
@property {Array} [params.fields] An array of field objects for the fieldsFunction and header row.
*/
export default function csvDownload(data, params = {}) {
  if (!Array.isArray(data)) {
    console.warn('Array argument for csvDownload must be an array');
    return;
  }

  // Set comma as default separator.
  params.separator ??= ',';

  const rows = data.map((record) => {
    const row = Array.isArray(params.fields)
      ? fieldsFunction(record, params.fields)
      : Object.values(record);

    return row.join(params.separator);
  });

  // Set default type for the blob.
  params.type ??= 'text/csv;charset=utf-8;';

  params.join ??= '\r\n';

  params.title ??= 'file';

  if (params.header && Array.isArray(params.fields)) {
    // Unshift the header row with either the title or field names.
    rows.unshift(params.fields.map((field) => field.title || field.field));
  }

  const blob = new Blob([rows.join(params.join)], { type: params.type });

  const link = document.createElement('a');

  link.download = `${params.title}.csv`;
  link.href = URL.createObjectURL(blob);
  link.dataset.downloadurl = ['csv', link.download, link.href].join(':');
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
}

/**
@function fieldsFunction

@description
The fieldsFunction method receives a record obect and the fields array param. The method iterated through the fields array and formats the record [field] property according the fields params object.

@param {Object} record A record object represents the data for a CSV row.
@param {Array} fields An array of field params objects.

@returns {Array} Returns an array of field string values to be merged joined as a CSV row.
*/
function fieldsFunction(record, fields) {
  return fields.map((field) => {
    if (!field.field) return;

    // Escape quotes in string value.
    if (typeof record[field.field] === 'string' && field.string) {
      return `"${record[field.field].replaceAll('"', '""')}"`;
    }

    // Format number toLocaleString
    if (field.formatter === 'toLocaleString') {
      const val = parseFloat(record[field.field]);

      if (isNaN(val)) return;

      return `"${val.toLocaleString(field.locale || navigator.language, field.options)}"`;
    }

    return record[field.field];
  });
}
