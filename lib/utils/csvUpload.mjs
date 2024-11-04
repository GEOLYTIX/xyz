/**
## mapp.utils.csvUpload()

@module /utils/csvUpload
@description
This utility exports the mapp.utils.csvUpload() method to upload a CSV to a database store.
*/

/**
 * @function csvUpload async
 * @description
 * This function uploads a CSV file to a database store.
 * @param {File} file - The CSV file to upload.
 * @param {Object} params - The parameters object.
 * @property {Boolean} [params.header] - If set to true, the first row is treated as a header row and not uploaded.
 * @property {Boolean} [params.headerCheck] - If set to true, the number of columns in the file is checked against the schema length.
 * @property {String} [params.headerCheckErrorMessage] - The error message to display if the number of columns in the file does not match the schema length.
 * @property {Array} params.schema - The schema array of column types.
 * @property {String} params.query - The query to upload the data.
 * @property {String} [params.updateQuery] - The query to run after the data is uploaded.
 * @property {Object} [params.queryparams] - The query parameters object.
 * @property {Number} [params.chunkSize] - The chunk size in bytes to upload the data in. Default is 4MB.
 * @returns {<Promise>} - The outcome object.
*/;

export default async function csvUpload(file, params = {}) {

    // Create an outcome object that will be returned at the end of the function.
    // This means other function that make use of this method can check if the import was successful.
    // They can then handle the success or failure of the import and show the user a relevant message. 
    const outcome = { success: true };

    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.readAsText(file);

        reader.onload = (e) => {
            let chunkSize = 0;
            const promises = [];
            let chunk = [];

            // Split text file into rows on carriage return / new line.
            let rows = e.target.result.trim().split(/\r?\n/);

            // Define the headers
            let headers = rows[0].replaceAll('"', '');
            // Turn headers into an array
            headers = headers.split(',');

            // Skip the header row if flagged in config.
            if (params.header) {
                rows = rows.slice(1);
            }

            // Check if headers length matches the schema length if headerCheck:true
            if (
                params.headerCheck &&
                headers.length != params.schema.length
            ) {

                // Populate the outcome object with the error message.
                // This provides the calling function with a message to display to the user, about why the import failed.
                outcome.success = false;
                outcome.message = `${mapp.dictionary.csv_upload_number_of_columns_imported} (${headers.length})
             ${mapp.dictionary.csv_upload_number_of_columns_required} 
                (${params.schema.length}). ${params.headerCheckErrorMessage || ''}`;

                resolve(outcome);
                return;
            }

            // Define schema methods.
            const schemaMethods = {
                Text: (x) => `'${x.replace(/'/g, '\'\'')}'`,
                Integer: (x) => parseInt(x.replace(/[^\d.-]/g, '')) || 'NULL',
                Float: (x) => parseFloat(x.replace(/[^\d.-]/g, '')) || 'NULL'
            };

            rows.forEach((_row) => {


                // Split row into fields array.
                const row = splitCSVIntoRow(_row);

                // Determine blob size of the row.
                const rowSize = new Blob([row]).size;

                // Check whether the chunk would exceed lambda payload limit.
                if (
                    chunkSize + rowSize >=
                    (params.chunkSize || 1024 * 1024 * 4)
                ) {

                    // Call the promisesFunction to upload the chunk.
                    promisesFunction(promises, chunk, params);

                    // Create a new current chunk.
                    chunk = [];
                    chunkSize = 0;
                }

                // Add row to current chunk and sum size.
                chunkSize += rowSize;
                chunk.push(row);
            });

            // Call the promisesFunction to upload the chunk.
            promisesFunction(promises, chunk, params);


            // Wait for all upload query promises to resolve.
            Promise.all(promises).then(async (responses) => {

                // Check if any of the promises errored on import
                responses.forEach(element => {
                    if (element instanceof Error) {

                        // Populate the outcome object with the error message.
                        // This provides the calling function with a message to display to the user, about why the import failed.
                        outcome.success = false;
                        outcome.message = `${mapp.dictionary.csv_upload_failed}`;

                        resolve(outcome);
                    }
                });

                // An updateQuery is ran once all the import promises have resolved.
                if (params.updateQuery) {
                    // Create an object to store the query and queryparams.
                    const queryObject = {};
                    queryObject.queryparams = params.queryparams || {};
                    queryObject.query = params.updateQuery;
                    const paramString = mapp.utils.paramString(mapp.utils.queryParams(queryObject));

                    // Execute updateQuery
                    await mapp.utils.xhr(`${mapp.host}/api/query?${paramString} `)
                        .then((response) => {

                            // Check if the response is an error
                            if (response instanceof Error) {

                                // Populate the outcome object with the error message.
                                // This provides the calling function with a message to display to the user, about why the import failed.
                                outcome.success = false;
                                outcome.message = `${mapp.dictionary.csv_upload_failed}`;

                                resolve(outcome);
                                return;
                            }

                            // If the response is not null, its possible the database returned a response.
                            if (response !== null) {
                                // We need to check if the database returns a response
                                const keys = Object.keys(response);
                                if (keys.length > 0) {
                                    // Get the value from the first key.
                                    const firstKey = keys[0];
                                    const value = response[firstKey];

                                    if (value) {
                                        // Populate the outcome object with the error message.
                                        // This provides the calling function with a message to display to the user
                                        // This response is returned from the database.
                                        outcome.success = false;
                                        outcome.message = `${value}`;

                                        resolve(outcome);
                                        return;
                                    }
                                }
                            }
                        })
                }

                // If we reach this point, the import was successful.
                outcome.message = `${rows.length} ${mapp.dictionary.csv_upload_rows_imported}`;
                resolve(outcome);
            }).catch(error => {
                outcome.success = false;
                outcome.message = error.message;
                resolve(outcome);
            });
        };
    });
}

/** 
@function splitCSVIntoRow
@description
This function splits a CSV row into fields.
It handles commas inside quotes and trims the fields before returning them.
This function is used by the csvUpload function to split the rows into fields.
It is used in place of a complex regular expression to handle CSV parsing.
These fields are then passed to the schema method to create a row string.
The function will return an array of fields if the fields match the schema length.

@param {String} row - The row to split.
@returns {Array} - The fields array.
*/
function splitCSVIntoRow(row) {

    // Create an array to store the fields.
    const fields = [];

    // Create a variable to store the current field.
    let currentField = '';

    let insideQuotes = false;

    // Loop through each character in the row.
    for (const character of row.length) {

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



    // Return if the fields array doesn't match the schema length.
    if (fields.length != params.schema.length) {
        return;
    }

    // Create row string for values from by passing field value to schema method.
    return `(${fields
        .map((v, i) => schemaMethods[params.schema[i]](v))
        .join()})`;

}

/**
 * @function promisesFunction
 * @description
 * This function pushes the upload query into the promises array.
 * It generates the paramString for the query and creates the url.
 * It is used by the csvUpload function to upload the chunk of data.
 * @param {Array} promises - The promises array.
 * @param {Array} chunk - The chunk of data to upload.
 * @param {Object} params - The parameters object.
*/
function promisesFunction(promises, chunk, params) {

    // Create an object to store the query and queryparams.
    const queryObject = {};
    queryObject.queryparams = params.queryparams || {};
    queryObject.query = params.query;
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(queryObject));

    const url = `${mapp.host}/api/query?${paramString}`;

    // Push upload query into promises array.
    promises.push(
        mapp.utils.xhr({
            method: 'POST',
            url,
            body: JSON.stringify({ arr: chunk }),
        })
    );
}