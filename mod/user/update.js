/**
@module /user/update
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

module.exports = async (req, res) => {

  // Remove spaces from email.
  const email = req.params.email.replace(/\s+/g, '')

  if (req.params.field === 'roles') {
    req.params.value = req.params.value?.split(',') || []
  }

  // Get user to update from ACL.
  let rows = await acl(`
  UPDATE acl_schema.acl_table
  SET
    ${req.params.field} = $2
    ${req.params.field === 'approved'
      && `, approved_by = '${req.params.user.email}|${new Date().toISOString().replace(/\..*/,'')}'`
      || ''}
  WHERE lower(email) = lower($1);`, [email, req.params.value])

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await languageTemplates({
      template: 'failed_query',
      language: req.params.language
    })

    return res.status(500).send(error_message)
  }

  const host = `${req.headers.origin 
    || req.headers.referer && new URL(req.headers.referer).origin 
    || 'https://' + (process.env.ALIAS || req.headers.host)}${process.env.DIR}`

  // Send email to the user account if an account has been approved.
  if (req.params.field === 'approved' && req.params.value === true) {
   
    await mailer({
      template: 'approved_account',
      language: req.params.user.language,
      to: email,
      host: host
    })
  }

  const update_ok = await languageTemplates({
    template: 'update_ok',
    language: req.params.user.language
  })

  return res.send(update_ok)
}