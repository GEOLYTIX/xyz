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

    const mailer = require('./mailer');

    const bcrypt = require('bcrypt-nodejs');

    fastify.route({
        method: 'GET',
        url: global.dir + '/login',
        handler: (req, res) => {
            res
                .type('text/html')
                .send(require('jsrender')
                    .templates('./views/login.html')
                    .render({dir: global.dir}))
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

            if (bcrypt.compareSync(req.body.password, result.rows[0].password)) {
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

            const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8));
            const verificationtoken = require('crypto').randomBytes(20).toString('hex');

            // set password for existing user and remove existing verification.
            if (user) {
                var user_db = await fastify.pg.users.connect();

                console.log(`
                UPDATE ${user_table} SET
                    verified = false,
                    password = '${password}',
                    verificationtoken = '${verificationtoken}'
                WHERE email = '${email}';`);

                await user_db.query(`
                UPDATE ${user_table} SET
                    verified = false,
                    password = '${password}',
                    verificationtoken = '${verificationtoken}'
                WHERE email = '${email}';`);
                user_db.release();
        
                mailer.mail({
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

            mailer.mail({
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
        .decorate('authAdmin', (req, res, done) =>
            chkLogin(req, res, 'admin', done))
        .after(authAdminRoutes);

    function authAdminRoutes() {

        // Open the user admin panel with a list of all user accounts.
        fastify.route({
            method: 'GET',
            url: global.dir + '/admin',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                let user_db = await fastify.pg.users.connect();

                result = await user_db.query(`
                SELECT
                    email,
                    verified,
                    approved,
                    admin
                FROM ${user_table};`);
    
                user_db.release();

                let users = result.rows;

                res
                    .type('text/html')
                    .send(require('jsrender')
                        .templates('./views/admin.html')
                        .render({
                            users: result.rows,
                            dir: process.env.DIR || ''
                        }));
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
                mailer.mail({
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
                mailer.mail({
                    to: user.email,
                    subject: `This account has been approved on ${global.site}`,
                    text: `You are now able to log on to ${req.protocol}://${global.site}`
                });

                res.send('The account has been approved by you. An email has been sent to the account holder.');

            }
        });

        // Endpoint for update requests from admin panel.
        fastify.route({
            method: 'POST',
            url: global.dir + '/update_user',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                // Find user by email and set role.
                user = await global.ORM.collections.users
                    .update({ email: req.body.email })
                    .set({ [req.body.role]: req.body.chk })
                    .fetch();

                user = user[0];

                // Return if no user account is found.
                if (!user) return res.json({ update: false });

                // Send email to the user account if an account has been approved.
                if (req.body.role === 'approved' && req.body.chk) {
                    mailer.mail({
                        to: user.email,
                        subject: `This account has been approved on ${global.site}`,
                        text: `You are now able to log on to ${req.protocol}://${global.site}`
                    });
                }

                // Return to admin panel.
                res.json({ update: true });

            }
        });

        // Endpoint for deleting user accounts from admin panel.
        fastify.route({
            method: 'POST',
            url: global.dir + '/delete_user',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                // Find user by email and set role.
                user = await global.ORM.collections.users
                    .destroy({ email: req.body.email })
                    .fetch();

                user = user[0];

                // Return if no user account is found.
                if (!user) return res.json({ delete: false });

                res.json({ delete: true });

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