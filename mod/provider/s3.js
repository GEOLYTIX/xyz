//const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

module.exports = async req => {

  if (!req.params.completeUpload)
    req.body = req.body && await bodyData(req) || null

  const s3Client = new S3Client({ credentials: { accessKeyId: process.env.KEY_AWSACCESSKEYID, secretAccessKey: process.env.KEY_AWSSECRETACCESSKEY }, region: 'eu-west-2' })

  try {

    if (req.params.upload)
      return upload(s3Client, req)

    if (req.params.getuploadID)
      return createMultiPartUpload(s3Client, req)

    if (req.params.uploadpart)
      return uploadpart(s3Client, req)

    if (req.params.completeUpload)
      return completeMultiPartUpload(s3Client, req)

  } catch (e) {
    console.log(e);
  }

}

async function upload(s3Client, req) {
  const command = new PutObjectCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename,
    Body: req.body
  })
  return s3Client.send(command);
}

async function createMultiPartUpload(s3Client, req) {
  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename
  });
  return await s3Client.send(command);
}

async function uploadpart(s3Client, req) {
  const command = new UploadPartCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename,
    Body: req.body,
    PartNumber: req.params.partnumber,
    UploadId: req.params.uploadid
  })
  return s3Client.send(command);
}

async function completeMultiPartUpload(s3Client, req) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename,
    MultipartUpload: {
      Parts: req.body
    },
    UploadId: req.params.uploadid
  })
  await s3Client.send(command);
}

function bodyData(req) {

  return new Promise((resolve, reject) => {

    const chunks = []

    req.on('data', chunk => chunks.push(chunk))

    req.on('end', () => resolve(Buffer.concat(chunks)))

    req.on('error', error => reject(error))

  })
}