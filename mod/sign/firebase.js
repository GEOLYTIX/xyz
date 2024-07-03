/**
@module /sign/firebase
*/

async function sign_firebase(req){

    let firebase_keys = 'FIREBASE_AUTH_URL,FIREBASE_API_KEY,TRANSPORT_EMAIL,FIREBASE_PASSWORD,FIREBASE_DB_URL'

    Object.keys(process.env).forEach( 
        element => {
            if(firebase_keys.includes(element)){
                firebase_keys = firebase_keys.replace(`,${element}`,'')
                firebase_keys = firebase_keys.replace(`${element},`,'')
                firebase_keys = firebase_keys.replace(element,'')
            }
        }
    )

    if(firebase_keys.length > 4){
        return {signedUrl: null, missing_keys: firebase_keys.split(',')}
    }

    let auth_url = `${process.env.FIREBASE_AUTH_URL}${process.env.FIREBASE_API_KEY}`
    let email = process.env.TRANSPORT_EMAIL
    let password = process.env.FIREBASE_PASSWORD
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
    return {signedUrl: url}
}

module.exports = async req => sign_firebase(req)