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

import mailer from '../utils/mailer.js';
import acl from './acl.js';

import login from './login.js';

/**
@function verify

@description
Attemps to find a user record with matching params.key verificationtoken.

Update `failedattempts=0`, `verified=true`, and `password=passwordreset` in the user record.

The verification token can only be used once and will be nulled in the ACL.

An email will be sent to all admin accounts requesting approval of the newly verified user account.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {string} req.params.key 
Verification key
@param {string} req.params.language
Request messaging language
*/

export default async (req, res) => {
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

  // One or more administrator have been
  if (rows.length > 0) {
    // Get array of mail promises.
    const mail_promises = rows.map(async (row) => {
      return await mailer({
        email: user.email,
        host: req.params.host,
        language: row.language,
        template: 'admin_email',
        to: row.email,
      });
    });

    // Continue after all mail promises have been resolved.
    Promise.allSettled(mail_promises)
      .then(async (arr) => {
        res.send(
          await languageTemplates({
            language: user.language,
            template: 'account_await_approval',
          }),
        );
      })
      .catch((error) => console.error(error));
  } else {
    // No admin accounts found in ACL.
    res.send(
      await languageTemplates({
        language: user.language,
        template: 'account_approved_no_admin',
      }),
    );
  }
};
