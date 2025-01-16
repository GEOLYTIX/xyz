/**
## /utils/csvUpload

This module exports the default csvUpload method for mapp utils module.

@module /utils/csvUpload
*/

// Define schema methods.
const schemaMethods = {
  // eslint-disable-next-line quotes
  Text: (val) => `'${val.replace(/'/g, "''")}'`,
  Integer: (val) => parseInt(val.replace(/[^\d.-]/g, '')) || 'NULL',
  Float: (val) => parseFloat(val.replace(/[^\d.-]/g, '')) || 'NULL',
};

/**
@function csvUpload 
@async

@description
This function uploads a CSV file to a database store.

@param {File} file The CSV file to upload.
@param {Object} params The parameters object.
@property {String} params.query The query to upload the data.
@property {Boolean} [params.async] If set to true, the data is uploaded asynchronously. Default is false.
@property {Boolean} [params.header] If set to true, the first row is treated as a header row and not uploaded.

@returns {<Promise>} The outcome object and any messages returned by the database.
*/
export default async function csvUpload(file, params = {}) {
  if (!params.query) {
    console.warn(`Query required`);
    return;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = async (e) => {
      // Split text file into rows on carriage return / new line.
      const rows = e.target.result.trim().split(/\r?\n/);

      // The file has a header row.
      if (params.header) {
        const headerRow = rows.shift();

        params.fields ??= headerRow.replaceAll('"', '').split(',');
      }

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
@property {Number} [params.chunkSize] The chunk size in bytes to upload the data in. Default is 4MB.
@property {Array} [params.schema] The schema array of column types.
@returns {Array} An array of field arrays chunked to size.
*/
function chunkRows(rows, params) {
  const chunks = [];

  params.chunkSize ??= 1024 * 1024 * 4; //kbyte?
  let chunkSize = 0;
  let chunk = [];

  rows.forEach((row) => {
    // Split row into fields array.
    const fields = splitRowIntoFields(row);

    // Create row string for values from by passing field value to schema method.
    const fieldsRow = `(${fields.map((v, i) => schemaMethods[params.schema?.[i] || 'Text'](v)).join()})`;

    // Determine blob size of the row.
    const rowSize = new Blob([fieldsRow]).size;

    // Check whether the chunk would exceed lambda payload limit.
    if (chunkSize + rowSize >= params.chunkSize) {
      chunks.push(structuredClone(chunk));

      // Create a new current chunk.
      chunk = [];
      chunkSize = 0;
    }

    // Add row to current chunk and sum size.
    chunkSize += rowSize;
    chunk.push(fieldsRow);
  });

  // Push the last chunk if it exists.
  if (chunk.length) chunks.push(chunk);

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
@returns {<Promise>} Returns promise from XHR query utility.
*/
function postRequestData(data, params) {
  params.queryparams ??= {};

  const queryParams = mapp.utils.queryParams(params);

  const paramString = mapp.utils.paramString(queryParams);

  const url = `${mapp.host}/api/query?${paramString}`;

  return mapp.utils.xhr({
    method: 'POST',
    url,
    body: JSON.stringify({ data }),
  });
}
