const env = require('../../mod/env');

const mailer = require('../../mod/mailer');

module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/user/delete',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_user: true
      })
    ]),
    handler: async (req, res) => {

      const email = req.query.email.replace(/\s+/g,'');

      // Delete user account in ACL.
      var rows = await env.acl(`
      DELETE FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [email]);

      if (rows.err) return res.redirect(env.path + '/login?msg=badconfig');

      // Sent email to inform user that their account has been deleted.
      await mailer({
        to: email,
        subject: `This ${env.alias || req.headers.host}${env.path} account has been deleted.`,
        text: `You will no longer be able to log in to ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}`
      });

      res.code(200).send('User account deleted.');

    }
  });

};