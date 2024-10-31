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
    const outcome = {};

    return new Promise((resolve, reject) => {
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
                outcome.error = `${mapp.dictionary.number_of_columns_imported} (${headers.length})
             ${mapp.dictionary.number_of_columns_required} 
                (${params.schema.length}). ${params.headerCheckErrorMessage || ''}`;

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
                const fields = _row.split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/);
                // Return if the fields array doesn't match the schema length.
                if (fields.length != params.schema.length) {
                    return;
                }

                // Create row string for values from by passing field value to schema method.
                const row = `(${fields
                    .map((v, i) => schemaMethods[params.schema[i]](v))
                    .join()})`;

                // Determine blob size of the row.
                const rowSize = new Blob([row]).size;

                // Check whether the chunk would exceed lambda payload limit.
                if (
                    chunkSize + rowSize >=
                    (params.chunkSize || 1024 * 1024 * 4)
                ) {

                    // Push upload query into promises array.
                    promises.push(
                        mapp.utils.xhr({
                            method: 'POST',
                            url:
                                `${mapp.host}/api/query?` +
                                mapp.utils.paramString({
                                    template: params.query,
                                }),
                            body: JSON.stringify({ arr: chunk }),
                        })
                    );

                    // Create a new current chunk.
                    chunk = [];
                    chunkSize = 0;
                }

                // Add row to current chunk and sum size.
                chunkSize += rowSize;
                chunk.push(row);
            });

            // Push final chunk and upload query promise.
            promises.push(
                mapp.utils.xhr({
                    method: 'POST',
                    url:
                        `${mapp.host}/api/query?` +
                        mapp.utils.paramString({
                            template: params.query,
                        }),
                    body: JSON.stringify({ arr: chunk }),
                })
            );

            // Wait for all upload query promises to resolve.
            Promise.all(promises).then(async (responses) => {

                // Check if any of the promises errored on import
                responses.forEach(element => {
                    if (element instanceof Error) {

                        // Populate the outcome object with the error message.
                        // This provides the calling function with a message to display to the user, about why the import failed.
                        outcome.error = `${mapp.dictionary.import_failed}`;
                        return;
                    }
                });

                // An updateQuery is ran once all the import promises have resolved.
                if (params.updateQuery) {
                    // Create an object to store the query and queryparams.
                    const queryObject = {};
                    queryObject.queryparams ??= params.queryparams || {};
                    queryObject.query = params.updateQuery;
                    const paramString = mapp.utils.paramString(mapp.utils.queryParams(queryObject));

                    // Execute updateQuery
                    await mapp.utils.xhr(`${mapp.host}/api/query?${paramString} `)
                        .then((response) => {

                            // Check if the response is an error
                            if (response instanceof Error) {

                                // Populate the outcome object with the error message.
                                // This provides the calling function with a message to display to the user, about why the import failed.
                                outcome.error = `${mapp.dictionary.import_failed}`;
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
                                        outcome.error = `${value}`;
                                    }
                                }
                            }
                        })
                }

                resolve(outcome); // Resolve with outcome at the end
            }).catch(error => {
                outcome.error = error.message;
                resolve(outcome);
            });
        };
    });
}