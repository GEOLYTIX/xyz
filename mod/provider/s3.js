const { 
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand } = require('@aws-sdk/client-s3');

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

module.exports = async req => {

  //dont data concatination if completing the upload.
  if (!req.params.command === 'completeUpload')
    req.body = req.body && await bodyData(req) || null

  //init of s3Client used to execute commands
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.KEY_AWSACCESSKEYID,
      secretAccessKey: process.env.KEY_AWSSECRETACCESSKEY
    },
    region: process.env.KEY_AWSREGION,
    Bucket: process.env.KEY_AWSBUCKET
  })

  const commands = {
    get,
    upload,
    getuploadID,
    uploadpart,
    completeUpload,
    list
  }

  return commands[req.params.command](s3Client, req)

}

async function get(s3Client, req) {

  const command = new GetObjectCommand({ 
    Bucket: req.params.bucket,
    Key: req.params.key
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
  const command = new PutObjectCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename,
    Body: req.body
  })
  return s3Client.send(command);
}

//inits the multipart upload that returns an id. The id is used for the uploadpart commands
async function getuploadID(s3Client, req) {
  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename
  });
  return await s3Client.send(command);
}

//uploadpart function that will provide a signed put url.
async function uploadpart(s3Client, req) {

  const command = new UploadPartCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename,
    PartNumber: req.params.partnumber,
    UploadId: req.params.uploadid
  })

  const presignedurl = await getSignedUrl(s3Client, command);

  return JSON.stringify(presignedurl);
}

//Function that will execute the CompleteMulti Part upload
async function completeUpload(s3Client, req) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.KEY_AWSBUCKET,
    Key: req.params.filename,
    MultipartUpload: {
      Parts: req.body //Requires an array of Etag's with their corresponding part numbers
    },
    UploadId: req.params.uploadid
  })
  return await s3Client.send(command);
}

//function to push data into an array
function bodyData(req) {

  return new Promise((resolve, reject) => {

    const chunks = []

    req.on('data', chunk => chunks.push(chunk))

    req.on('end', () => resolve(Buffer.concat(chunks)))

    req.on('error', error => reject(error))

  })
}