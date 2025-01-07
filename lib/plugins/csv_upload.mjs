
/**
@module /plugins/csv_upload
@description
The csv_upload plugin module returns a button to upload a CSV file.
A entry or layer object is passed to the csv_upload method.
*/

/**
@function csv_upload
@description
The csv_upload method returns a button to upload a CSV file.
The csv_upload method is called with the layer object.
The csv_upload method is called with the entry object.
*/
export function csv_upload() {
    // Return a button in the layer panel to upload a CSV file.
    mapp.ui.layers.panels.csv_upload = csvUploadButton;

    // Return a button in the infoj to upload a CSV file.
    mapp.ui.locations.entries.csv_upload = csvUploadButton;

}
/**
@function csvUploadButton 
 
@description
The csvUploadButton method returns a button to upload a CSV file.
Onchange, the upload method is called with the event and the layer.csv_upload method.
Onclick, the value of the target is set to an empty string, so that the same file can be uploaded multiple times.
@param {Object} params - The layer / entry object that the button is being created for.
@property {Object} csv_upload - The parameters required to upload the CSV file.
@returns {html} button
*/
function csvUploadButton(params) {

    // Create a button to click to open a dialog that allows the user to upload a CSV file.
    params.csv_upload.btn = mapp.utils.html.node`<button 
    class="raised bold wide primary-colour",
    data-id=${`csv-upload-${params.key}`}
    onclick=${(e) => {

            // classList.toggle resolves as true when the class is added.
            if (e.target.classList.toggle('active')) {

                openDialog(params)

            } else {

                // The decorated dialog object has a close method.
                params.csv_upload.close()
            }
        }}>${params.csv_upload.btn_label || mapp.dictionary.csv_upload_import}`;

    // Return a button to upload a CSV file.
    params.csv_upload.import = mapp.utils.html.node`
    <h2>${params.csv_upload.dialog_label || ''}</h2>
    <input 
        type=file class="raised bold wide primary-colour"
        accept=".csv"
        onchange=${async (e) => upload(e, params)}
        onclick=${(e) => e.target.value = ''}>`;

    return params.csv_upload.btn

};


/**
@function openDialog
@description
Opens the csv_upload panel in a dialog.
 
@param {Object} layer
@property {Object} layer.csv_upload The configuration paramters of the csv_upload panel
*/
async function openDialog(params) {

    // Add queryparams to the params object.
    params.csv_upload.queryparams ??= {};

    // Spread the layer and mapview queryparams to the queryparams.
    params.csv_upload.queryparams = {
        ...params?.mapview?.locale?.queryparams,
        ...params?.layer?.queryparams,
        ...params?.queryparams,
        ...params?.csv_upload.queryparams,
        ...params?.location?.layer.queryparams,
        ...params?.location?.layer.mapview.locale.queryparams,
    }

    params.csv_upload.header = mapp.utils.html`<h1
      class="csv-upload-header">${mapp.dictionary.csv_upload_import}</h1>`;

    Object.assign(params.csv_upload, {
        data_id: `${params.key}-csv-upload-dialog`,
        target: document.getElementById('Map'),
        height: 'auto',
        left: '83%',
        top: '0.5em',
        class: 'box-shadow',
        css_style: 'min-width: 300px;',
        containedCentre: true,
        contained: true,
        headerDrag: true,
        minimizeBtn: true,
        closeBtn: true,
        content: params.csv_upload.import,
        onClose: (e) => {

            // Remove the active class from the button
            params.csv_upload.btn.classList.remove('active');
        }
    })

    mapp.ui.elements.dialog(params.csv_upload);
}

/**
@function upload 
@ description
The upload method is called with the event and the layer.csv_upload method.
Disable the view while uploading.
Call the mapp util method.
If the upload was successful, enable the view, otherwise log an error message.
@param {Object} e - The event object.
@param {Object} params - The layer / entry object that the upload is happening on.
@property {Object} view - The view that is being disabled / enabled.
*/

async function upload(e, params) {

    const view = params.view || params.location.layer.view;
    // Disable view while uploading
    view.classList.add('disabled');

    // Call the mapp util method.
    const uploaded = await mapp.utils.csvUpload(e.target.files[0], params.csv_upload);

    const outcome = { success: true };

    // If the upload was successful and an updateQuery is defined. 
    if (uploaded.success && params.updateQuery) {
        // Create an object to store the query and queryparams.
        const queryObject = {};
        queryObject.queryparams = params.csv_upload.queryparams || {};
        queryObject.query = params.updateQuery;
        const paramString = mapp.utils.paramString(mapp.utils.queryParams(queryObject));

        // Execute updateQuery
        mapp.utils.xhr(`${mapp.host}/api/query?${paramString} `)
            .then((response) => {

                // Check if the response is an error
                if (response instanceof Error) {

                    // Populate the outcome object with the error message.
                    // This provides the calling function with a message to display to the user, about why the import failed.
                    outcome.success = false;
                    outcome.message = `${mapp.dictionary.csv_upload_failed}`;
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
                            return;
                        }
                    }
                }
            })
    }
    // If the upload was unsuccessful, alert the user.
    if (uploaded.success === false || outcome.success === false) {
        mapp.ui.elements.alert({ title: mapp.dictionary.csv_upload_failed, text: uploaded.message || outcome.message });
        // Enable the view.
        view.classList.remove('disabled');
    }
    // If the upload was successful, enable the view and alert the user that the data was imported successfully.
    else {

        view.classList.remove('disabled');
        mapp.ui.elements.alert({ title: mapp.dictionary.csv_upload_success, text: uploaded.message || outcome.message });
        // Set the button to inactive.
        params.csv_upload.btn.classList.remove('active');
        // Close the dialog.
        params.csv_upload.close();

        // Re-render the infoj. 
        params?.location?.view.dispatchEvent(new Event('render'));

        // Reload the layer.
        if (params?.reload) {
            params?.reload();
        }
    }
};
