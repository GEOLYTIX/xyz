module.exports = {routes, chkLogin}

function routes(fastify) {

    const user_table = (process.env.LOGIN || process.env.ADMIN) ?
        (process.env.LOGIN || process.env.ADMIN).split('|')[1] :
        null;

    if (user_table) {
        fastify.register(require('fastify-postgres'), {
            connectionString: (process.env.LOGIN || process.env.ADMIN).split('|')[0],
            name: 'users'
        });
    }

    fastify.route({
        method: 'GET',
        url: '/login',
        handler: (req, res) => {
            res
                .type('text/html')
                .send(require('jsrender')
                    .templates('./views/login.html')
                    .render())
        }
    });

    fastify.route({
        method: 'GET',
        url: '/register',
        handler: (req, res) => {
            res
                .type('text/html')
                .send(require('jsrender')
                    .templates('./views/register.html')
                    .render())
        }
    });    

    fastify.route({
        method: 'GET',
        url: '/logout',
        handler: (req, res) => {
            req.session = {};
            res.redirect('/');
        }
    });

    fastify.route({
        method: 'POST',
        url: '/login',
        handler: async (req, res) => {

            let user_db = await fastify.pg.users.connect();

            result = await user_db.query(
                `SELECT * FROM ${user_table} WHERE email = $1`, [req.body.email]);

            user_db.release();

            if (require('bcrypt-nodejs').compareSync(req.body.password, result.rows[0].password)) {
                req.session.user = {
                    email: result.rows[0].email,
                    verified: result.rows[0].verified,
                    approved: result.rows[0].approved,
                    admin: result.rows[0].admin
                };
                res.redirect(req.session.redirect);
            } else {
                res.send({ result: 'farts' });
            }                           
        }
    });

}

function chkLogin(req, res, login, done){

    if (!login) return done();

    req.session.redirect = req.req.url;
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (login && !req.session.user[login] === true) {
        return res.redirect('/login');
    }
    
    done();
}