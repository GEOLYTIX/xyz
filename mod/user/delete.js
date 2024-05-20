/**
@module /user/delete
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

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
  let rows = await acl(`
    DELETE FROM acl_schema.acl_table
    WHERE lower(email) = lower($1)
    RETURNING *;`, [email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

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