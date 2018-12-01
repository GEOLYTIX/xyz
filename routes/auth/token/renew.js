module.exports = fastify => {
    
  fastify.route({
    method: 'GET',
    url: '/auth/token/renew',
    handler: (req, res) => {

      if (global.logs && req.query.nanoid) console.log({
        nanoid: req.query.nanoid,
        timenow: req.query.timenow,
        token: req.query.token
      });

      fastify.jwt.verify(req.query.token, (err, token) => {
        if (err) {
          err.details = {
            timenow: Date.now(),
            token: req.query.token
          };
          fastify.log.error(err);
          return res.code(401).send();
        }
        delete token.iat;
        delete token.exp;
        res.send(fastify.jwt.sign(token, { expiresIn: 120 }));
      });
    }
  });

};