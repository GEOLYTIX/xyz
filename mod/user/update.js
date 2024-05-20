/**
@module /user/update
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

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

  // Send email to the user account if an account has been approved.
  if (req.params.field === 'approved' && req.params.value === true) {
   
    await mailer({
      template: 'approved_account',
      language: req.params.user.language,
      to: email,
      host: req.params.host
    })
  }

  const update_ok = await languageTemplates({
    template: 'update_ok',
    language: req.params.user.language
  })

  return res.send(update_ok)
}