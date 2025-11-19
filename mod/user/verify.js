/**
## /user/verify

Exports the [user] verify method for the /api/user/verify route.

@requires module:/user/acl
@requires module:/user/login
@requires module:/utils/mailer
@requires module:/utils/languageTemplates
@requires module:/utils/processEnv

@module /user/verify
*/

import languageTemplates from '../utils/languageTemplates.js';
import mailer from '../utils/resend.js';
import acl from './acl.js';
import login from './login.js';

/**
@function verify
@async

@description
Attemps to find a user record with matching params.key verificationtoken.

Update `failedattempts=0`, `verified=true`, and `password=passwordreset` in the user record.

The verification token can only be used once and will be nulled in the ACL.

An email will be sent to all admin accounts requesting approval of the newly verified user account.

The adminList parameter can be used to limit the administrators to be contacted for user approval.

eg. `adminList=dennis@geolytix.co.uk`

Request parameter will be parsed as an array if defined with brackets.

eg. `adminList=[dennis@geolytix.co.uk,robert@geolytix.co.uk]`

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params Request parameter.
@property {string} params.key Verification key.
@property {string} params.language Request messaging language.
@property {array|string} params.adminList Request paramater string will be parsed as array if defined in [].
*/
export default async function verify(req, res) {
  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.');
  }

  // Find user record with matching verificationtoken.
  let rows = await acl(
    `
    SELECT email, language, approved, password_reset
    FROM acl_schema.acl_table
    WHERE verificationtoken = $1;`,
    [req.params.key],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  const user = rows[0];

  if (!user) {
    const token_not_found = await languageTemplates({
      language: req.params.language,
      template: 'token_not_found',
    });

    return res.status(302).send(token_not_found);
  }

  // Update user account in ACL with the approval token and remove verification token.
  await acl(
    `
    UPDATE acl_schema.acl_table SET
      failedattempts = 0,
      password = $3,
      verified = true,
      verificationtoken = null,
      language = $2
    WHERE lower(email) = lower($1);`,
    [user.email, req.params.language || user.language, user.password_reset],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  // Account is already approved.
  // eg. on password reset
  if (user.approved) {
    // Login with message if account is approved and password reset.
    if (user.password_reset) {
      // Set root location which will open the login view.
      res.setHeader('location', `${xyzEnv.DIR || '/'}?msg=password_reset_ok`);

      return res.status(302).send();
    }

    return login(req, res);
  }

  // Get all admin accounts from the ACL.
  rows = await acl(`
    SELECT email, language
    FROM acl_schema.acl_table
    WHERE admin = true;`);

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  //Filter out admins not in the list
  if (req.params.adminList)
    rows = rows.filter((adminAcc) =>
      req.params.adminList.includes(adminAcc.email),
    );

  // One or more administrator have been
  if (rows.length > 0) {
    res.send(
      await languageTemplates({
        language: user.language,
        template: 'account_await_approval',
      }),
    );

    const emailTemplates = [];

    for (const admin of rows) {
      const emailTemplate = {
        email: user.email,
        host: req.params.host,
        language: admin.language,
        template: 'admin_email',
        to: admin.email,
      };

      emailTemplates.push(emailTemplate);
    }

    await mailer.batch(emailTemplates);
  } else {
    // No admin accounts found in ACL.
    res.send(
      await languageTemplates({
        language: user.language,
        template: 'account_approved_no_admin',
      }),
    );
  }
}
