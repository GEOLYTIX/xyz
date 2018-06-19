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

    function loginView(req, res, msg) {
        res
            .type('text/html')
            .send(require('jsrender')
                .templates('./views/login.html')
                .render({ dir: global.dir, msg: msg }));
    }

    fastify.route({
        method: 'GET',
        url: global.dir + '/logout',
        handler: (req, res) => {
            req.session = {};
            loginView(req, res, 'Logged out from application.');
        }
    });

    fastify.route({
        method: 'GET',
        url: global.dir + '/login',
        handler: (req, res) => {
            loginView(req, res);
        }
    });

    fastify.route({
        method: 'POST',
        url: global.dir + '/login',
        handler: async (req, res) => {

            var user_db = await fastify.pg.users.connect();
            result = await user_db.query(
                `SELECT * FROM ${user_table} WHERE email = $1;`,
                [req.body.email]
            );
            user_db.release();

            let user = result.rows[0];

            if (!user) return loginView(req, res, 'User account not found in access control list.');

            if (!user.verified) return loginView(req, res, 'User account email not yet verified.');

            if (!user.approved) return loginView(req, res, 'User account not yet approved by site administrator.');

            if (require('bcrypt-nodejs').compareSync(req.body.password, user.password)) {
                req.session.user = {
                    email: user.email,
                    verified: user.verified,
                    approved: user.approved,
                    admin: user.admin
                };
                return res.redirect(req.session.redirect || global.dir || '/');
            } else {
                return loginView(req, res, 'Wrong password.');
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

                require('./mailer')({
                    to: user.email,
                    subject: `Please verify your GEOLYTIX account (password reset) on ${global.site}`,
                    text: `A new password has been set for this account. \n \n`
                        + `Please verify that you are the account holder: ${global.protocol}://${global.site}/admin/user/verify/${verificationtoken}`
                });

                return loginView(req, res, `You have reset the password <br />`
                + `A verification mail has been sent to your registered address. <br />`
                + `Please follow the link in the email to verify that you are the account holder. <br />`
                + `You must verify your account before you are able to login with your new password.`);
            }

            var user_db = await fastify.pg.users.connect();
            await user_db.query(`
            INSERT INTO ${user_table} (email, password, verificationtoken)
            SELECT
                '${email}' AS email,
                '${password}' AS password,
                '${verificationtoken}' AS verificationtoken;`);
            user_db.release();

            require('./mailer')({
                to: email,
                subject: `Please verify your GEOLYTIX account on ${req.headers.host}${global.dir}`,
                text: `A new account for this email address has been registered with ${req.headers.host}${global.dir} \n \n`
                    + `Please verify that you are the account holder: ${global.protocol}://${req.headers.host}${global.dir}/admin/user/verify/${verificationtoken} \n \n`
                    + `A site administrator must approve the account before you are able to login. \n \n`
                    + `You will be notified via email once an adimistrator has approved your account.`
            });

            loginView(req, res, `We registered your email address in the access control list. <br />`
                + `A verification mail has been sent to your registered address. <br />`
                + `Please follow the link in the email to verify that you are the account holder. <br />`
                + `A site administrator must approve the account before you are able to login. <br />`
                + `You will be notified via email once an adimistrator has approved your account.`);
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
                        subject: `This account has been approved for ${req.headers.host}${global.dir}`,
                        text: `You are now able to log on to ${global.protocol}://${req.headers.host}${global.dir}`
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
                        subject: `This ${req.headers.host}${global.dir} account has been deleted.`,
                        text: `You will no longer be able to log in to ${global.protocol}://${req.headers.host}${global.dir}`
                    });

                    res.code(200).send()
                };

            }
        });

        // Check verification token and verify account
        fastify.route({
            method: 'GET',
            url: global.dir + '/admin/user/verify/:token',
            handler: async (req, res) => {

                // Find user account from matching token.
                var user_db = await fastify.pg.users.connect();
                var result = await user_db.query(
                    `SELECT * FROM ${user_table} WHERE verificationtoken = $1;`,
                    [req.params.token]
                );
                user_db.release();

                user = result.rows[0];

                if (!user) return res.send('Token not found.');

                if (user.verified && user.admin) return res.redirect(global.dir || '/');

                if (user.verified) return res.send('User account has already been verfied but is still awaiting administrator approval.');

                if (!user.approved){
                    let approvaltoken = require('crypto').randomBytes(20).toString('hex');

                    var user_db = await fastify.pg.users.connect();
                    let update = await user_db.query(`
                        UPDATE ${user_table} SET
                            verified = true,
                            approvaltoken = '${approvaltoken}'
                        WHERE email = $1;`, [user.email]);
                    user_db.release();
    
                    // Get all admin accounts from the ACL.
                    var user_db = await fastify.pg.users.connect();
                    var result = await user_db.query(`
                        SELECT email
                        FROM ${user_table}
                        WHERE admin = true;`);
                    user_db.release();
    
                    if (result.rowCount === 0) return res.send('No admin accounts were found.');
    
                    // Create an array of all admin account emails.
                    let adminmail = result.rows.map(admin => admin.email);
    
                    // Sent an email to all admin account emails with a request to approve the new user account.
                    require('./mailer')({
                        to: adminmail,
                        subject: `A new account has been verified on ${req.headers.host}${global.dir}`,
                        text: `Please log into the admin panel ${global.protocol}://${req.headers.host}${global.dir}/admin/user to approve ${user.email} \n \n`
                            + `You can also approve the account by following this link: ${global.protocol}://${req.headers.host}${global.dir}/admin/user/approve/${approvaltoken}`
                    });
                }

                var user_db = await fastify.pg.users.connect();
                let update = await user_db.query(`
                    UPDATE ${user_table} SET
                        verified = true
                    WHERE email = $1;`, [user.email]);
                user_db.release();

                if (user.approved) return res.redirect(global.dir || '/');

                res.send('The account has been verified and is awaiting administrator approval.');
            }
        });

        // Check verification token and approve account
        fastify.route({
            method: 'GET',
            url: global.dir + '/admin/user/approve/:token',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                var user_db = await fastify.pg.users.connect();
                var result = await user_db.query(
                    `SELECT * FROM ${user_table} WHERE approvaltoken = $1;`,
                    [req.params.token]
                );
                user_db.release();

                user = result.rows[0];

                if (!user) return res.send('Token not found.');

                var user_db = await fastify.pg.users.connect();
                let update = await user_db.query(`
                                    UPDATE ${user_table} SET
                                        approved = true,
                                        approvaltoken = '${user.approvaltoken}'
                                    WHERE email = $1;`, [user.email]);
                user_db.release();

                require('./mailer')({
                    to: user.email,
                    subject: `This account has been approved on ${req.headers.host}${global.dir}`,
                    text: `You are now able to log on to ${global.protocol}://${req.headers.host}${global.dir}`
                });

                res.send('The account has been approved by you. An email has been sent to the account holder.');
            }
        });
    }
}

function chkLogin(req, res, login, done) {

    if (!login) return done();

    //console.log(login);

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