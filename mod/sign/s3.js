/**
### /sign/s3
Signs requests to S3. Provides functions for get, list, delete and put to S3.

> For public buckets you do not need to use the s3 sign in order to get or list from the bucket. 
> See bellow for examples of how public interactions 

The module requires AWS_S3_CLIENT credentials in the xyzEnv and will export as null if the credentials are not provided. The credentials consist of two parts: an access key ID and a secret access key eg: `AWS_S3_CLIENT="accessKeyId=AKIAIOSFODNN7EXAMPLE&secretAccessKey=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`. [Both the access key ID and secret access key together are required to authenticate your requests]{@link https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html}.

Sample requests for common S3 SDK commands. Please refer to the S3 SDK documentation for detailed information in regards to the Command methods.

```js
let url; // URL to be signed.

// List S3 Bucket
url = `${host}/api/sign/s3?` + mapp.utils.paramString({
  command: 'ListObjectsV2Command',
  Bucket,
  Region})

// Get object from S3 Bucket
url = `${host}/api/sign/s3?` + mapp.utils.paramString({
  command: 'GetObjectCommand',
  Key, //file name
  Bucket,
  Region})

// Get object from S3 Bucket
url = `${host}/api/sign/s3?` + mapp.utils.paramString({
  command: 'PutObjectCommand',
  Key, //file name
  Bucket,
  Region})
  
// Get object from S3 Bucket
url = `${host}/api/sign/s3?` + mapp.utils.paramString({
  command: 'DeleteObjectCommand',
  Key, //file name
  Bucket,
  Region})  

// Sign URL
const signedURL = await mapp.utils.xhr({
  url,
  responseType: 'text'
})

// Public Bucket Operations (No credentials needed)
// List bucket contents
url = `https://${Bucket}.s3.${Region}.amazonaws.com?list-type=2`

// Get object
url = `https://${Bucket}.s3.${Region}.amazonaws.com/${Key}`
```
Note: Write operations (PUT, DELETE) are not available for public buckets.

The aws-sdk/client-s3 and aws-sdk/s3-request-presigner are optional dependencies. The require will fail and the module will export as null if these optional dependencies are not installed.

@requires aws-sdk/client-s3
@requires aws-sdk/s3-request-presigner
@requires module:/utils/processEnv
@module /sign/s3
*/

let clientSDK, getSignedUrl, credentials;

// Check if optional dependencies are available
try {
  clientSDK = await import('@aws-sdk/client-s3');
  ({ getSignedUrl } = await import('@aws-sdk/s3-request-presigner'));
} catch {
  // Dependencies not installed
}

export default xyzEnv.AWS_S3_CLIENT
  ? (() => {
      try {
        // Create credentials object from AWS_S3_CLIENT
        credentials = Object.fromEntries(
          new URLSearchParams(xyzEnv.AWS_S3_CLIENT),
        );

        // Check if we successfully imported the optional dependencies
        if (!clientSDK || !getSignedUrl) {
          return null;
        }

        return s3_signer;
      } catch (err) {
        return null;
      }
    })()
  : null;

/**
@function s3_signer
@async

@description
The S3 signer method checks whether the command string parameter exists in the S3 clientSDK.

The provided request params will be spread into the Command object created from the S3 clientSDK.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@property {Object} req.params Request parameter.
@property {String} params.command S3Client SDK command.

@returns {Promise<String>} The signed url associated to the request params.
**/
async function s3_signer(req, res) {
  const S3Client = new clientSDK.S3Client({
    credentials,
    region: req.params.Region,
  });

  if (!Object.hasOwn(clientSDK, req.params.command)) {
    return res.status(400).send(`S3 clientSDK command validation failed.`);
  }

  // Spread req.params into the clientSDK Command.
  const Command = new clientSDK[req.params.command]({ ...req.params });

  const signedURL = await getSignedUrl(S3Client, Command, {
    expiresIn: 3600,
  });

  return signedURL;
}
