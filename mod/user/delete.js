/**
## /user/delete

Exports the deleteUser method for the /api/user/delete route.

@requires module:/user/acl
@requires module:/utils/mailer

@module /user/add
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

/**
@function deleteUser

@description
/api/user/delete?email=dennis@geolytix.co.uk

The deleteUser method is routed by the User API module.

The method must be requested by a user with admin priviliges or by a user wanting to delete their own ACL record.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {string} req.params.email 
Email to add.
@param {Object} req.params.user 
Requesting user.
@param {boolean} req.params.user.admin 
Requesting user is admin.
*/

module.exports = async function deleteUser(req, res) {

  // acl module will export an empty require object without the ACL being configured.
  if (typeof acl !== 'function') {
    return res.status(500).send('ACL unavailable.')
  }

  if (!req.params.email) {

    return res.status(500).send('Missing email param')
  }

  if (!req.params.user) {

    return new Error('login_required')
  }

  const email = req.params.email.replace(/\s+/g, '')

  // A user may remove themselves from the ACL.
  if (req.params.user?.email === email) {

    // The cookie must be set to null on successful return from delete method.
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

    console.log(`${email} removed themselves`)

  } else if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

  // Delete user account in ACL.
  const rows = await acl(`
    DELETE FROM acl_schema.acl_table
    WHERE lower(email) = lower($1)
    RETURNING *;`,
    [email])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }

  const user = rows[0]

  // Sent email to inform user that their account has been deleted.
  await mailer({
    template: 'deleted_account',
    language: user.language,
    to: user.email,
    host: req.params.host
  })

  res.send('User account deleted.')
}
