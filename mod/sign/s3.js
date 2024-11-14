/**
### /sign/s3
Signs requests to S3. Provides functions for get, list, delete and put to S3.

The module requires AWS_S3_CLIENT credentials in the process.env and will export as null if the credentials are not provided. The credentials consist of two parts: an access key ID and a secret access key eg: `AWS_S3_CLIENT="accessKeyId=AKIAIOSFODNN7EXAMPLE&secretAccessKey=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`. [Both the access key ID and secret access key together are required to authenticate your requests]{@link https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html}.

The aws-sdk/client-s3 and aws-sdk/s3-request-presigner are optional dependencies. The require will fail and the module will export as null if these optional dependencies are not installed.

@requires aws-sdk/client-s3
@requires aws-sdk/s3-request-presigner

@module /sign/s3
*/

let
  clientSDK,
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  getSignedUrl;

if(!process.env.AWS_S3_CLIENT){

  //Assume the bucket is public if no credentials are supplied
  console.log('Sign S3: AWS_S3_CLIENT was not found in the env')

  module.exports = null
} else{

  //Attempt import if credentials are found
  try {

    //Assign constructors and functions from the sdks.
    clientSDK = require('@aws-sdk/client-s3');

    getSignedUrl = require('@aws-sdk/s3-request-presigner').getSignedUrl;
  
    S3Client = clientSDK.S3Client
    PutObjectCommand = clientSDK.PutObjectCommand
    GetObjectCommand = clientSDK.GetObjectCommand
    DeleteObjectCommand = clientSDK.DeleteObjectCommand
    ListObjectsCommand = clientSDK.ListObjectsV2Command
  
    //Export the function .
    module.exports = s3
  }
  catch (err) {
  
    //The module has not been installed.
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('AWS-SDK is not available')
      module.exports = null
    }
    else throw err
  }  
}

//Assign the corresponding function to the requested command
const commands = {
  get: (req) => objectAction(req.params, GetObjectCommand),
  trash: (req) => objectAction(req.params, DeleteObjectCommand),
  put: (req) => objectAction(req.params, PutObjectCommand),
  list: (req) => objectAction(req.params, ListObjectsCommand)
}

/**
@function s3
@async

@description
The s3 signer method signs requests for the s3 service.

Provides methods for list, get, trash and put

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} params.region
@param {string} params.bucket
@param {string} params.key
@param {string} params.command

@returns {Promise<String>} The signed url associated to the request params.
**/
async function s3(req, res) {

  //Read credentials from an env key
  const credentials = Object.fromEntries(new URLSearchParams(process.env.AWS_S3_CLIENT))

  req.params.S3Client = new clientSDK.S3Client({
    credentials,
    region: req.params.region
  })

  if (!Object.hasOwn(commands, req.params.command)) {
    return res.status(400).send(`S3 command validation failed.`)
  }

  return commands[req.params.command](req)
}

/**
@function objectAction
@async

@description
Generates the signed url for the command and parameters specified from the request

@param {Function} objectCommand The S3 function to be carried out.
@param {Object} reqParams Request parameters.
@property {string} reqParams.region
@property {string} reqParams.bucket
@property {string} reqParams.key
@property {string} reqParams.command

@returns {String} The signed url associated to the request params.
**/
async function objectAction(reqParams, objectCommand) {

  //The parameters required per action for S3
  //S3 Parameters are capitalised
  const actionParams = {
    get: { 'key': 'Key', 'bucket': 'Bucket' },
    list: { 'bucket': 'Bucket' },
    put: { 'key': 'Key', 'bucket': 'Bucket', 'region': 'Region' },
    trash: { 'key': 'Key', 'bucket': 'Bucket' }
  }

  try {

    //Transfrom our keys into aws key names
    const commandParams = Object.keys(reqParams)
      .filter(key => Object.keys(actionParams[reqParams.command]).includes(key))
      .reduce((acc, key) => ({
        ...acc,
        ...{ [actionParams[reqParams.command][key]]: reqParams[key] }
      }),
        {}
      )

    const command = new objectCommand(commandParams)

    const signedURL = await getSignedUrl(reqParams.S3Client, command, {
      expiresIn: 3600,
    });

    return signedURL;

  } catch (err) {
    console.error(err)
  }
}
