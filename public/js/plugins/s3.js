export default (function () {

    mapp.ui.layers.panels.s3bucket_upload = layer => {

        layer.s3bucket_upload.btn = mapp.utils.html.node`
                <input type=file accept=".csv" style="font-size: 11px;" class="flat bold wide primary-colour"
                onchange=${upload}>`

        async function upload(e) {

            var csvFile = new Blob([layer.s3bucket_upload.btn.files[0]], { type: 'text/csv' });
            var fileSize = csvFile.size;

            if (fileSize >= 1024 * 1024 * 10) {

                var multipartUpload = await mapp.utils.xhr({
                    method: "GET",
                    url: `${layer.mapview.host}/api/provider/s3?` +
                        mapp.utils.paramString({
                            getuploadID: true,
                            filename: layer.s3bucket_upload.btn.files[0].name
                        })
                });

                // console.log(multipartUpload.UploadId);

                var chunkSize = 1024 * 1024 * 5; var fileSize = csvFile.size;
                var chunks = Math.ceil(csvFile.size / chunkSize, chunkSize);
                var chunk = 0;
                var uploadPartResults = []
                var uploadPromises = []

                console.log('file size..', fileSize);
                console.log('chunks...', chunks);

                while (chunk < chunks) {
                    var offset = chunk * chunkSize;
                    console.log('current chunk..', chunk);
                    console.log('offset...', chunk * chunkSize);
                    console.log('file blob from offset...', offset);

                    var signedURL = await mapp.utils.xhr({
                        method: "GET",
                        url: `${layer.mapview.host}/api/provider/s3?` +
                            mapp.utils.paramString({
                                uploadpart: true,
                                uploadid: multipartUpload.UploadId,
                                filename: layer.s3bucket_upload.btn.files[0].name,
                                partnumber: chunk + 1
                            })
                    });

                    console.log(signedURL);

                    var uploadPromise = mapp.utils.xhr({
                        method: "PUT",
                        url: signedURL,
                        body: csvFile.slice(offset, offset + chunkSize),
                        contentType: 'application/octet-stream',
                        resolveTarget: true
                    });

                    uploadPromises.push(uploadPromise);
                    chunk++;
                }

                var count = 1;

                Promise.allSettled(uploadPromises).
                    then((results) => results.forEach((result) => {
                        uploadPartResults.push({
                            PartNumber: count,
                            ETag: result.value.getResponseHeader('ETag')
                        });
                        count++;
                    }
                    )).then(() => {
                        mapp.utils.xhr({
                            method: "POST",
                            url: `${layer.mapview.host}/api/provider/s3?` +
                                mapp.utils.paramString({
                                    uploadid: multipartUpload.UploadId,
                                    filename: layer.s3bucket_upload.btn.files[0].name,
                                    completeUpload: true
                                }),
                            body: JSON.stringify(uploadPartResults)
                        });
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