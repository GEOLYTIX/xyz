const env = require('../../mod/env');

const mailer = require('../../mod/mailer');

module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/user/update',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        admin_user: true
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          email: { type: 'string' },
          field: { type: 'string' },
        },
        required: ['token', 'email', 'field']
      }
    },
    preHandler: [
      fastify.evalParam.token,
      fastify.evalParam.userSchemaField,
    ],
    handler: async (req, res) => {

      // Remove spaces from email.
      const email = req.query.email.replace(/\s+/g,'');

      if (req.query.field === 'roles') {
        req.query.value = `'{"${req.query.value.replace(/\s+/g,'').split(',').join('","')}"}'`;
      }

      // Get user to update from ACL.
      var rows = await env.acl(`
        UPDATE acl_schema.acl_table
        SET
          ${req.query.field} = ${req.query.value},
          approved_by = '${req.params.token.email}'
        WHERE lower(email) = lower($1);`,
      [email]);
  
      if (rows.err) return res.code(500).send(new Error('Failed to query PostGIS table.'));
  
      // Send email to the user account if an account has been approved.
      if (req.query.field === 'approved' && req.query.value)
        await mailer({
          to: email,
          subject: `This account has been approved for ${env.alias || req.headers.host}${env.path}`,
          text: `You are now able to log on to ${req.headers.host.includes('localhost') && 'http' || 'https'}://${env.alias || req.headers.host}${env.path}`
        });
  
      return res.code(200).send('Update successful.');
    }

  });
};