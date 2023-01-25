const {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

module.exports = async req => {

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.KEY_AWSACCESSKEYID,
      secretAccessKey: process.env.KEY_AWSSECRETACCESSKEY
    },
    region: req.params.region
  })

  const commands = {
    get,
    upload,
    trash,
    getuploadID,
    uploadpart,
    completeUpload,
    list
  }

  return commands[req.params.command](s3Client, req)
}

async function trash(s3Client, req) {

  const command = new DeleteObjectCommand({
    Key: req.params.key,
    Bucket: req.params.bucket
  })

  return s3Client.send(command);
}

async function get(s3Client, req) {

  const command = new GetObjectCommand({
    Key: req.params.key,
    Bucket: req.params.bucket
  })

  const signedURL = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return JSON.stringify(signedURL);
}

async function list(s3Client, req) {

  const command = new ListObjectsCommand({ Bucket: req.params.bucket })
  return s3Client.send(command);
}

//upload function for files that are lower than 4.5mb
async function upload(s3Client, req) {

  const Body = await new Promise((resolve, reject) => {

    const chunks = []

    req.on('data', chunk => chunks.push(chunk))

    req.on('end', () => resolve(Buffer.concat(chunks)))

    req.on('error', error => reject(error))

  })

  const command = new PutObjectCommand({
    Key: req.params.key,
    Bucket: req.params.bucket,
    Body
  })
  return s3Client.send(command);
}

//inits the multipart upload that returns an id. The id is used for the uploadpart commands
async function getuploadID(s3Client, req) {
  const command = new CreateMultipartUploadCommand({
    Key: req.params.key,
    Bucket: req.params.bucket
  });
  return await s3Client.send(command);
}

//uploadpart function that will provide a signed put url.
async function uploadpart(s3Client, req) {

  const command = new UploadPartCommand({
    Key: req.params.key,
    Bucket: req.params.bucket,
    PartNumber: req.params.partnumber,
    UploadId: req.params.uploadid
  })

  const presignedurl = await getSignedUrl(s3Client, command);

  return JSON.stringify(presignedurl);
}

//Function that will execute the CompleteMulti Part upload
async function completeUpload(s3Client, req) {
  const command = new CompleteMultipartUploadCommand({
    Key: req.params.key,
    Bucket: req.params.bucket,
    MultipartUpload: {
      Parts: req.body //Requires an array of Etag's with their corresponding part numbers
    },
    UploadId: req.params.uploadid
  })
  return await s3Client.send(command);
}