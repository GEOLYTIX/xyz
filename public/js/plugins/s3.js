export default (function () {

    mapp.ui.layers.panels.s3bucket_upload = layer => {

        layer.s3bucket_upload.btn = mapp.utils.html.node`
                <input type=file style="font-size: 11px;" class="flat bold wide primary-colour"
                onchange=${upload}>`

        async function upload(e) {

            //Getting the file from the input and setting the size
            const csvFile = new Blob([layer.s3bucket_upload.btn.files[0]], { type: 'text/csv' });
            const fileSize = csvFile.size;

            //We will need to use a multipart upload if the file is greater than 4.5mb
            if (fileSize >= 1024 * 1024 * 4.5) {

                //Init the multipart upload. This will return an object with id from the api.
                const multipartUpload = await mapp.utils.xhr({
                    method: "GET",
                    url: `${layer.mapview.host}/api/provider/s3?` +
                        mapp.utils.paramString({
                            getuploadID: true,
                            filename: layer.s3bucket_upload.btn.files[0].name
                        })
                });

                //Set the chunk size and determine the number of chunks by dividing the file size by the chunk size and then round up.
                const chunkSize = 1024 * 1024 * 5;
                const chunks = Math.ceil(csvFile.size / chunkSize, chunkSize);

                //Chunk has to start at 0, but when referenced in the part number we have to increment by 1.
                let chunk = 0;
                let uploadPartResults = []
                let uploadPromises = []
                let uploadCount = 0;

                //Push the chunks of data to a UploadPart promise
                while (chunk < chunks) {

                    //Determine the offset of data per chunk
                    let offset = chunk * chunkSize;

                    //get the signedurl from the s3 provider
                    //You need to provide what kind of method to the provider, 
                    //the uploadid, filename, and what part we are uploading.
                    let signedURL = await mapp.utils.xhr({
                        method: "GET",
                        url: `${layer.mapview.host}/api/provider/s3?` +
                            mapp.utils.paramString({
                                uploadpart: true,
                                uploadid: multipartUpload.UploadId,
                                filename: layer.s3bucket_upload.btn.files[0].name,
                                partnumber: chunk + 1
                            })
                    });

                    //Creating the promise to push into an array
                    //This promise also need to resolve the entire target, so we can return the ETag header.
                    let uploadPromise = mapp.utils.xhr({
                        method: "PUT",
                        url: signedURL,
                        body: csvFile.slice(offset, offset + chunkSize),
                        contentType: 'application/octet-stream',
                        resolveTarget: true
                    }).then( (result) => {
                        uploadCount++;
                        console.log(`${Math.round(uploadCount/chunks*100,0)}%`)
                        return result;
                    });

                    //Push promise and increment the chunk counter.
                    uploadPromises.push(uploadPromise);
                    chunk++;
                }

                //Count for the part number when pushing upload results.
                let count = 1;

                //After all promises have been settled, then we will push the upload results
                //These results are required to complete the upload.
                Promise.allSettled(uploadPromises).
                    then((results) => results.forEach((result) => {
                        uploadPartResults.push({
                            PartNumber: count,
                            ETag: result.value.getResponseHeader('ETag')
                        });
                        count++;
                    }
                    )).then(async () => {

                        //After all settled and pushed, we complete the Multipartupload.
                        let completeUploadRes = await mapp.utils.xhr({
                            method: "POST",
                            url: `${layer.mapview.host}/api/provider/s3?` +
                                mapp.utils.paramString({
                                    uploadid: multipartUpload.UploadId,
                                    filename: layer.s3bucket_upload.btn.files[0].name,
                                    completeUpload: true
                                }),
                            body: JSON.stringify(uploadPartResults)
                        });

                        if(completeUploadRes.$metadata.httpStatusCode === 200)
                            alert(`File ${layer.s3bucket_upload.btn.files[0].name} successfully uploaded`)

                    });

            } else {
                await mapp.utils.xhr({
                    method: "POST",
                    url: `${layer.mapview.host}/api/provider/s3?` +
                        mapp.utils.paramString({
                            upload: true,
                            filename: layer.s3bucket_upload.btn.files[0].name
                        }),
                    body: csvFile,
                    contentType: 'application/blob'
                });
            }
        }

        return mapp.utils.html.node`${layer.s3bucket_upload.btn}`

    }
}
)()