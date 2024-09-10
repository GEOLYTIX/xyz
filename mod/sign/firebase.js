/**
## /sign/firebase

A module for producing signed urls for use with firebase object storage.

@module /sign/firebase
*/

module.exports = async req => sign_firebase(req)

/**
@function sign_firebase

@description Creates a signed url for object storage within firebase.

@param {req} req.email - The users email address.
@param {req} req.instance - The instance the user is on.
@returns {Object} Object containing the signed url e.g {signedUrl: xxxxxx}
*/
async function sign_firebase(req) {

  //Check for keys needed to make the request in the workspace
  let firebase_keys = 'FIREBASE_AUTH_URL,FIREBASE_API_KEY,TRANSPORT_EMAIL,FIREBASE_PASSWORD,FIREBASE_DB_URL'

  Object.keys(process.env).forEach(
    element => {
      if (firebase_keys.includes(element)) {

        //If the key is found remove it from the list
        firebase_keys = firebase_keys.replace(`,${element}`, '')
        firebase_keys = firebase_keys.replace(`${element},`, '')
        firebase_keys = firebase_keys.replace(element, '')
      }
    }
  )

  //Send missing keys if something is not available for the request
  if (firebase_keys.length > 4) {
    return { signedUrl: null, missing_keys: firebase_keys.split(',') }
  }

  let auth_url = `${process.env.FIREBASE_AUTH_URL}${process.env.FIREBASE_API_KEY}`
  let email = process.env.TRANSPORT_EMAIL
  let password = process.env.FIREBASE_PASSWORD

  //Use the private key to determine whether its a dev or live instance
  let environment = process.env.PRIVATE.includes('pg.a') ? 'live' : 'dev'

  const response = await fetch(auth_url, {
    method: 'POST',
    body: JSON.stringify(
      {
        email: email,
        password: password,
        returnSecureToken: true
      }),
  });

  const responseJSON = await response.json()

  const url = `${process.env.FIREBASE_DB_URL}/${environment}_workspaces/${req.params.instance}/${req.params.email}.json?auth=${responseJSON.idToken}`

  return { signedUrl: url }
}
