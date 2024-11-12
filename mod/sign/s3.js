/**
@module /sign/s3

Signs requests to S3. Provides functions for get, list, delete and put to S3. 
*/

const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsCommand
} = require('@aws-sdk/client-s3')

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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
module.exports = async function s3(req, res){
    
  //Read credentials from an env key
  const credentials = Object.fromEntries(new URLSearchParams(process.env.AWS_S3_CLIENT))

  const s3Client = new S3Client({
    credentials,
    region: req.params.region
  })

  req.params.s3Client = s3Client

  //Assign the corresponding function to the requested command
  const commands = {
    get: () => objectAction(req.params,GetObjectCommand),
    trash: () => objectAction(req.params,DeleteObjectCommand),
    put: () => objectAction(req.params,PutObjectCommand),
    list: () => objectAction(req.params,ListObjectsCommand)
  }

  if (!Object.hasOwn(commands, req.params.command)) {
    return res.status(400).send(`S3 command validation failed.`)
  }

  return commands[req.params.command]()
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
        get: {'key':'Key','bucket': 'Bucket'},
        list: {'bucket': 'Bucket'},
        put: {'key': 'Key','bucket': 'Bucket','region': 'Region'},
        trash: {'key': 'Key','bucket': 'Bucket'}
    }

    try {
  
      //Transfrom our keys into aws key names
      const commandParams = Object.keys(reqParams)
            .filter(key => Object.keys(actionParams[reqParams.command]).includes(key))
            .reduce((acc, key) => ({
                ...acc,
                ...{ [actionParams[reqParams.command][key]]: reqParams[key]}
            }),
            {}
        )

      const command = new objectCommand(commandParams)
  
      const signedURL = await getSignedUrl(reqParams.s3Client, command, {
        expiresIn: 3600,
      });
  
      return JSON.stringify(signedURL);
      
    } catch (err) {
      console.error(err)
    }
}
