/**
@module /provider/s3
*/

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const env = require('../../mapp_env.js')

module.exports = async (req, res) => {

  const credentials = Object.fromEntries(new URLSearchParams(env.AWS_S3_CLIENT))

  const s3Client = new S3Client({
    credentials,
    region: req.params.region
  })


  const commands = {
    get,
    put,
    trash,
    list
  }

  if (!Object.hasOwn(commands, req.params.command)) {
    return res.status(400).send(`S3 command validation failed.`)
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

  try {

    const command = new GetObjectCommand({
      Key: req.params.key,
      Bucket: req.params.bucket
    })

    const signedURL = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return JSON.stringify(signedURL);
    
  } catch (err) {
    console.error(err)
  }
}

async function put(s3Client, req) {

  try {

    const command = new PutObjectCommand({
      Key: req.params.key,
      Bucket: req.params.bucket,
      Region: req.params.region
    });

    const signedURL = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return JSON.stringify(signedURL);
    
  } catch (err) {
    console.error(err)
  }
}

async function list(s3Client, req) {

  try {

    const command = new ListObjectsCommand({ Bucket: req.params.bucket })
    const response = await s3Client.send(command);

    return response

  } catch (err) {
    console.error(err)
  }
}