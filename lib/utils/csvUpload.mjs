/**
## /utils/csvUpload

This module exports the default csvUpload method for mapp utils module.

This utility supplies a way to insert data into a table from a csv file.

The function takes a File object and reads the contents.

The data is sanatised (see `splitRowIntoFields`) and then passed to the supplied `query` param.

```json
{
  query: "sql_table_insert"
  queryparams: {
      table: "scratch"
  }
  layer: {}
  fields: {
    "numeric_field": "numeric",
    "char_field": "text"
  }
}

 - layer: the layer on which the csv upload is being done.
 - queryparams.table: the table being inserted on.
 - fields: this describes the fields being inserted, the name of the field is used as the key and the type is the value of the key

The function transforms the read data into an object as below:
```json
  {
    "numeric_field::numeric":[
      1,2,3
    ],
    "char_field::text":[
      'a','b','c'
    ]
  }

```

This data is passed to the relevant insert query (defaults to `sql_table_insert`).

Additionally files exceeding the lambda upload limit (6mb) will be chunked into parts and inserted separately.

@module /utils/csvUpload
*/

/**
@typedef {Object} schemaMethods
schemaMethods are used to convert the field values to the correct type for the database.
The methods are used in the chunkRows method to convert the field values to the correct type for the database.

@property {function} int Parse value as integer.
@property {function} numeric Parse value as float.
@property {function} text Replace quotes in string values.
@property {function} varchar Replace quotes in string values.
*/
const schemaMethods = {
  int: (val) => parseInt(val.replace(/[^\d.-]/g, '')) || null,
  numeric: (val) => parseFloat(val.replace(/[^\d.-]/g, '')) || null,
  text: (val) => `${val.replace(/'/g, "''")}`,
  varchar: (val) => `${val.replace(/'/g, "''")}`,
};

/**
@function csvUpload
@async

@description
This function uploads a CSV file to a database store.

@param {File} file The CSV file to upload.
@param {Object} params The parameters object.
@property {String} params.query The query to upload the data.
@property {Object} params.fields The definition of the columns being inserted e.g. {field: field_type}.
@property {String} params.layer The layer on which the csv upload is being done. This is only required if using the sql_table_insert query.
@property {String} params.queryparams.table The table being inserted into. Only required if using the sql_table_insert query.
@property {Boolean} [params.async] If set to true, the data is uploaded asynchronously. Default is false.
@property {Boolean} [params.header] If set to true, the first row is treated as a header row and not uploaded.

@returns {Promise<Object|Error>} The outcome object and any messages returned by the database.
*/
export default async function csvUpload(file, params = {}) {
  if (!params.query) {
    return new Error(`A query must be supplied for the csv upload.`);
  }

  if (!params.fields) {
    return new Error(
      `Fields are required to define the columns being inserted. Please supply a fields object in the format "fields": {"field_name": "field_type"}".`,
    );
  }

  if (params.query === 'sql_table_insert') {
    if (!params.queryparams.layer) {
      return new Error(`A layer must be supplied for the insert query.`);
    }

    if (!params.queryparams.table) {
      return new Error(
        `A table must be supplied for the insert query. Please supply a table in the queryparams object.`,
      );
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = async (e) => {
      // Split text file into rows on carriage return / new line.
      const rows = e.target.result.trim().split(/\r?\n/);

      // Check the number of columns in the csv across all rows and return the highest count.
      const columnCounts = rows.map((row) => splitRowIntoFields(row).length);
      const columnCount = Math.max(...columnCounts);

      if (columnCount !== Object.keys(params.fields).length) {
        // Return an error if the number of columns in the CSV file does not match the number of fields supplied.
        resolve([
          new Error(
            `The number of columns in the CSV file (${columnCount}) does not match the number of fields supplied (${
              Object.keys(params.fields).length
            }). Please check your CSV file and try again.`,
          ),
        ]);
        return;
      }

      // The file has a header row.
      if (params.header) rows.shift();

      const chunks = chunkRows(rows, params);

      let responses = [];

      // If async = true, then we need to wait for all promises to resolve before returning the outcome object.
      if (params.async) {
        responses = await Promise.all(
          chunks.map((chunk) => postRequestData(chunk, params)),
        );
      }

      // If async = false, run them synchhronously.
      else {
        for (const chunk of chunks) {
          const response = await postRequestData(chunk, params);
          responses.push(response);
        }
      }

      resolve(responses);
    };
  });
}

/**
@function chunkRows
@description
The method iterates over each row in the rows param. And returns an array of chunks according to max payload size for the POST request.

@param {array} rows An array of rows extracted from the CSV file.
@param {object} params Parameter for chunking the rows array.
@property {Object} params.fields The definition of the columns being inserted e.g. {field: field_type}.
@property {Number} [params.chunkSize] The chunk size in bytes to upload the data in. Defaults to 4MB.
@property {Array} [params.schema] The schema array of column types.
@returns {Array} An array of field arrays chunked to size.
*/
function chunkRows(rows, params) {
  const chunks = [];

  // Set default chunksize in bytes.
  params.chunkSize ??= 4000000;
  let chunkSize = 0;
  let chunk = {};

  rows.forEach((row) => {
    // Split row into fields array.
    const fields = splitRowIntoFields(row);

    for (const indx in fields) {
      const field = Object.keys(params.fields)[indx];
      const type = params.fields[field];

      //assign field definition to its type with a `::` separator e.g. field::field_type
      chunk[`${field}::${type}`] ??= [];
      chunk[`${field}::${type}`].push(schemaMethods[type](fields[indx]));

      // Determine blob size in bytes for the chunk.
      const rowSize = new Blob([chunk]).size;

      // Check whether the chunk would exceed lambda payload limit.
      if (chunkSize + rowSize >= params.chunkSize) {
        chunks.push(structuredClone(chunk));

        // Create a new current chunk.
        chunk = {};
        chunkSize = 0;
      }

      // Add row to current chunk and sum size.
      chunkSize += rowSize;
    }
  });

  // Push the last chunk if it exists.
  if (Object.keys(chunk).length) chunks.push(chunk);

  return chunks;
}

/**
@function splitRowIntoFields
@description
The method splits a CSV row string into fields.

@param {String} row The row to split.
@returns {Array} The fields array.
*/
function splitRowIntoFields(row) {
  // Create an array to store the fields.
  const fields = [];

  // Create a variable to store the current field.
  let currentField = '';

  let insideQuotes = false;

  // Loop through each character in the row.
  for (const character of row) {
    // This if statement checks if the character is a double quote.
    if (character === '"') {
      // If the character is a double quote, we toggle the insideQuotes variable, which will be used to determine if we are inside a quote.
      insideQuotes = !insideQuotes;
    }
    // If the character is a comma and we are not inside quotes, we push the current field to the fields array.
    else if (character === ',' && !insideQuotes) {
      // Push current field to fields array
      fields.push(currentField.trim());

      // Reset for the next field
      currentField = '';
    } else {
      // Add character to current field
      currentField += character;
    }
  }

  // Push the last field (if any) after the loop to the fields array.
  if (currentField) {
    fields.push(currentField.trim());
  }

  return fields;
}

/**
@function postRequestData
@description
The method returns a parameterised query object from the XHR utility method.

@param {Array} data Data for the post request body.
@param {Object} params Parameters for the post query.
@returns {Promise<Object|Error>} Returns promise from XHR query utility.
*/
function postRequestData(data, params) {
  params.queryparams ??= {};

  const queryParams = mapp.utils.queryParams(params);

  const paramString = mapp.utils.paramString(queryParams);

  const url = `${mapp.host}/api/query?${paramString}`;

  return mapp.utils.xhr({
    body: JSON.stringify(data),
    method: 'POST',
    url,
  });
}
