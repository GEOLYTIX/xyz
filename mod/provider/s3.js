/**
@module /provider/s3
@deprecated

@description
Provides a way to call get, put, trash and list. Directly interfaces with s3

This module has been deprecated and replaced with {@link module:/sign/s3~s3}
*/

/**
@function s3
@async

@description
The s3 provider method will redirect requests to the signer.

Provides methods for list, get, trash and put

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.

@returns {Request} A redirect to the s3 signer.
**/
module.exports = async function s3(req, res) {
  
    const commands = {
      get,
      put,
      trash,
      list
    }
  
    if (!Object.hasOwn(commands, req.params.command)) {
      return res.status(400).send(`S3 command validation failed.`)
    }
  
    const paramString = Object.keys(req.params).filter(param => ['command','bucket','key','region'].includes(param)).map(param => `${param}=${req.params[param]}`).join('&')

    res.setHeader('location', `${process.env.DIR}/api/sign/s3?${paramString}`)

    return res.status(301).send()
}