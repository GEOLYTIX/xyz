module.exports = { routes, chkLogin }

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
        url: global.dir + '/login',
        handler: (req, res) => {
            res
                .type('text/html')
                .send(require('jsrender')
                    .templates('./views/login.html')
                    .render({ dir: global.dir }))
        }
    });

    fastify.route({
        method: 'POST',
        url: global.dir + '/login',
        handler: async (req, res) => {

            let user_db = await fastify.pg.users.connect();

            result = await user_db.query(
                `SELECT * FROM ${user_table} WHERE email = $1;`,
                [req.body.email]
            );

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

    fastify.route({
        method: 'GET',
        url: global.dir + '/register',
        handler: (req, res) => {
            res
                .type('text/html')
                .send(require('jsrender')
                    .templates('./views/register.html')
                    .render());
        }
    });

    fastify.route({
        method: 'POST',
        url: global.dir + '/register',
        handler: async (req, res) => {

            const email = req.body.email;

            var user_db = await fastify.pg.users.connect();

            result = await user_db.query(
                `SELECT * FROM ${user_table} WHERE email = $1;`,
                [email]
            );

            user_db.release();

            let user = result.rows[0];

            const password = require('bcrypt-nodejs').hashSync(req.body.password, require('bcrypt-nodejs').genSaltSync(8));
            const verificationtoken = require('crypto').randomBytes(20).toString('hex');

            // set password for existing user and remove existing verification.
            if (user) {
                var user_db = await fastify.pg.users.connect();

                await user_db.query(`
                UPDATE ${user_table} SET
                    verified = false,
                    password = '${password}',
                    verificationtoken = '${verificationtoken}'
                WHERE email = $1;`, [email]);
                user_db.release();

                require('./mailer').mail({
                    to: user.email,
                    subject: `Please verify your GEOLYTIX account (password reset) on ${global.site}`,
                    text: `A new password has been set for this account. \n \n`
                        + `Please verify that you are the account holder: ${req.protocol}://${global.site}/verify/${verificationtoken}`
                });

                return;
            }

            var user_db = await fastify.pg.users.connect();
            await user_db.query(`
            INSERT INTO ${user_table} (email, password, verificationtoken)
            SELECT
                ${email} AS email,
                ${password} AS password,
                ${verificationtoken} AS verificationtoken;`);
            user_db.release();

            require('./mailer').mail({
                to: user.email,
                subject: `Please verify your GEOLYTIX account on ${global.site}`,
                text: `A new account for this email address has been registered with ${global.site}. \n \n`
                    + `Please verify that you are the account holder: ${req.protocol}://${global.site}/verify/${verificationtoken} \n \n`
                    + `A site administrator must approve the account before you are able to login. \n \n`
                    + `You will be notified via email once an adimistrator has approved your account.`
            });

            return;

        }
    });

    fastify.route({
        method: 'GET',
        url: global.dir + '/logout',
        handler: (req, res) => {
            req.session = {};
            res.redirect(global.dir || '/');
        }
    });

    fastify
        .decorate('authAdmin', (req, res, done) => chkLogin(req, res, 'admin', done))
        .after(authAdminRoutes);

    function authAdminRoutes() {

        // Open the user admin panel with a list of all user accounts.
        fastify.route({
            method: 'GET',
            url: global.dir + '/admin/user',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                var user_db = await fastify.pg.users.connect();
                let result = await user_db.query(`
                    SELECT
                        email,
                        verified,
                        approved,
                        admin
                    FROM ${user_table};`);
                user_db.release();

                res
                    .type('text/html')
                    .send(require('jsrender')
                        .templates('./views/admin.html')
                        .render({
                            users: result.rows,
                            dir: global.dir
                        }));
            }
        });

        // Endpoint for update requests from admin panel.
        fastify.route({
            method: 'POST',
            url: global.dir + '/admin/user/update',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                var user_db = await fastify.pg.users.connect();
                let update = await user_db.query(`
                    UPDATE ${user_table} SET ${req.body.role} = ${req.body.chk}
                    WHERE email = $1;`, [req.body.email]);
                user_db.release();

                // Send email to the user account if an account has been approved.
                if (req.body.role === 'approved' && req.body.chk)
                    await require('./mailer')({
                        to: req.body.email,
                        subject: `This account has been approved for ${req.headers.origin}`,
                        text: `You are now able to log on to ${req.headers.origin}`
                    });

                if (update.rowCount === 0) res.code(500).send();
                if (update.rowCount === 1) res.code(200).send();

            }
        });

        // Endpoint for deleting user accounts from admin panel.
        fastify.route({
            method: 'POST',
            url: global.dir + '/admin/user/delete',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                var user_db = await fastify.pg.users.connect();
                let update = await user_db.query(`
                    DELETE FROM ${user_table}
                    WHERE email = $1;`, [req.body.email]);
                user_db.release();

                if (update.rowCount === 0) res.code(500).send();
                if (update.rowCount === 1) {

                    await require('./mailer')({
                        to: req.body.email,
                        subject: `This ${req.headers.origin} account has been deleted.`,
                        text: `You will no longer be able to log in to ${req.headers.origin}`
                    });

                    res.code(200).send()
                };

            }
        });        

        // Check verification token and verify account
        fastify.route({
            method: 'GET',
            url: global.dir + '/verify/:token',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                // Find user account from matching token and timestamp.
                let user = await global.ORM.collections.users.findOne({ verificationToken: req.params.token });

                // Return if user account is not found.
                if (!user) return res.send('Token not found.');

                // Return if user account is not found.
                if (user.verified) return res.send('User account has already been verfied.');

                user = await global.ORM.collections.users
                    .update({ email: user.email })
                    .set({
                        verified: true,
                        verificationToken: require('crypto').randomBytes(20).toString('hex')
                    })
                    .fetch();

                user = user[0];

                // Get all admin accounts from the ORM users collection.
                let admins = await global.ORM.collections.users.find({ admin: true });

                if (admins.length === 0) {
                    req.session.messages = ['No admin accounts were found'];
                    return res.send('No admin accounts were found.');
                }

                // Create an array of all admin account emails.
                let adminmail = admins.map(admin => admin.email);

                // Sent an email to all admin account emails with a request to approve the new user account.
                require('./mailer').mail({
                    to: adminmail,
                    subject: `A new account has been verified on ${global.site}`,
                    text: `Please log into the admin panel to approve ${user.email} \n \n`
                        + `You can also approve the account by following this link: ${req.protocol}://${global.site}/approve/${user.verificationToken}`
                });

                // Update session messages and send success notification to client.
                req.session.messages = ['An email has been sent to the site administrator'];
                res.send('The account has been verified and is awaiting administrator approval.');

            }
        });

        // Check verification token and approve account
        fastify.route({
            method: 'GET',
            url: global.dir + '/approve/:token',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                // Find user account from matching token and timestamp.
                let user = await global.ORM.collections.users
                    .findOne({ verificationToken: req.params.token });

                // Return if the token is not found.
                if (!user) return res.send('Token not found.');

                user = await global.ORM.collections.users
                    .update({ email: user.email })
                    .set({ approved: true })
                    .fetch();

                user = user[0];

                // Sent an email to the account holder to notify about the changes.
                require('./mailer').mail({
                    to: user.email,
                    subject: `This account has been approved on ${global.site}`,
                    text: `You are now able to log on to ${req.protocol}://${global.site}`
                });

                res.send('The account has been approved by you. An email has been sent to the account holder.');

            }
        });
    }
}

function chkLogin(req, res, login, done) {

    if (!login) return done();

    //uhm!
    req.session.redirect = req.req.url;

    if (!req.session.user) {
        return res.redirect(global.dir + '/login');
    }

    if (login === true && req.session.user.verified && req.session.user.approved) {
        return done();
    }

    if (login && !req.session.user[login] === true) {
        return res.redirect(global.dir + '/login');
    }

    done();
}