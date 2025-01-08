/**
@global
@typedef {Object} env
The process.ENV object holds configuration provided to the node process from the launch environment. The environment configuration allows the provision of keys and secrets which must not be accessible from the client. All env properties are limited to string type.
@property {String} [DIR=''] The XYZ API path which concatenated with the domain for all requests.
@property {String} [DBS_=''] DBS_* values are the connections used to establish connections to pg servers with the [dbs]{@link module:/utils/dbs} module. 
@property {String} [PORT='3000'] The port on which the express app listens to for requests.
@property {String} [COOKIE_TTL='36000'] The Time To Live for all cookies issued by the XYZ API.
@property {String} [TITLE='GEOLYTIX | XYZ'] The TITLE value is used to identify cookies and is provided to as a param to Application View templates.
@property {String} [LOGS] The LOGS string will split on comma to determine which requests send to the [LOGGER]{@link module:/utils/logger} module will be logged.
@property {String} [LOGGER] Required to configure the [LOGGER]{@link module:/utils/logger} module for a remote out.
@property {String} [PRIVATE] All requests to XYZ API require authentication. The PRIVATE value represents the ACL connection.
@property {String} [PUBLIC] General requests to XYZ API do require authentication. The PUBLIC value represents an ACL connection for optional authentication.
@property {String} [SECRET] A secret string is required to sign and [validate JWT]{@link module:/user/auth}.
@property {String} [USER_SESSION] The [auth module]{@link module:/user/auth} will store and check a session key if the USER_SESSION env is not undefined.
@property {String} [AUTH_EXPIRY] The [user/fromACL module]{@link module:/user/fromACL} can expiry user authorization if the AUTH_EXPIRY env is configured.
@property {String} [FAILED_ATTEMPTS='3'] The [user/fromACL module]{@link module:/user/fromACL} will expire user validation if failed login attempts exceed the FAILED_ATTEMPTS value.
@property {String} [PASSWORD_REGEXP='(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{10,}$'] The [user/register module]{@link module:/user/register} will apply PASSWORD_REGEXP value to check the complexity of provided user passwords.
@property {String} [STATEMENT_TIMEOUT] The [utils/dbs module]{@link module:/utils/dbs} will apply the STATEMENT_TIMEOUT to the query.client.
@property {String} [RETRY_LIMIT='3'] The [utils/dbs module]{@link module:/utils/dbs} will apply the RETRY_LIMIT to the query.client.
@property {String} [WORKSPACE_AGE] The [workspace/cache module]{@link module:/mod/workspace/cache} flashes the workspace cache after the WORKSPACE_AGE is reached.
@property {String} [CUSTOM_TEMPLATES] The [workspace/cache module]{@link module:/mod/workspace/cache} caches templates defined as a src in the CUSTOM_TEMPLATES env.
@property {String} [TRANSPORT] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_HOST] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_EMAIL] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_PASSWORD] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_PORT] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [USER_DOMAINS] The [user/register module]{@link module:/user/register} will limit the registration to user emails for domains provided in the comma seperated USER_DOMAINS env.
@property {String} [SRC_] SRC_* values will replace the key wildcard [*] in the stringified workspace.
@property {String} [KEY_CLOUDFRONT] A key [*.pem] file matching the KEY_CLOUDFRONT value is required for authentication requests in the [cloudfront]{@link module:/provider/cloudfront} provider module.
@property {String} [AWS_S3_CLIENT] A AWS_S3_CLIENT env is required to sign requests with the [s3]{@link module:/sign/s3} signer module.
@property {String} [CLOUDINARY_URL] A CLOUDINARY_URL env is required to sign requests with the [cloudinary]{@link module:/sign/cloudinary} signer module.
@property {String} [SAML_ENTITY_ID] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_LOGIN] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_SP_CRT] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_ACS] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_SSO] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_SLO] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_IDP_CRT] Required authentication via [SAML]{@link module:/user/saml}.
*/

process.env.PORT ??= 3000

process.env.DIR ??= ''

process.env.TITLE ??= 'GEOLYTIX | XYZ'

// Assign default age in ms.
process.env.WORKSPACE_AGE ??= 3600000

process.env.COOKIE_TTL ??= 36000

process.env.FAILED_ATTEMPTS ??= 3

process.env.RETRY_LIMIT ??= 3;


const env = {}

Object.entries(process.env).forEach(entry => {
    env[entry[0]] = entry[1]
})

module.exports = env