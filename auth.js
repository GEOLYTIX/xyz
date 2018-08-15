module.exports = { init, authToken }

function init(fastify) {

    // Get ACL table name from env settings.
    const user_table = (process.env.PUBLIC || process.env.PRIVATE) ?
        (process.env.PUBLIC || process.env.PRIVATE).split('|')[1] : null;

    // Register the ACL database from env settings connection string.
    if (user_table) {
        fastify.register(require('fastify-postgres'), {
            connectionString: (process.env.PUBLIC || process.env.PRIVATE).split('|')[0],
            name: 'users'
        });
    }

    fastify.register(async (fastify, opts, next) => {

        fastify.route({
            method: 'GET',
            url: '/login',
            handler: (req, res) => {

                const msgs = {
                    fail: `Login has failed.<br />`
                        + `This may be due to insufficient priviliges or the account being locked.<br />`
                        + `More details will have been sent via mail to prevent user enumeration.`,
                    validation: `Redirect from registry or password reset.<br />`
                        + `Please check your inbox for an email with additional details.`,
                    reset: `The password has been reset for this account.`
                };

                res
                    .type('text/html')
                    .send(require('jsrender')
                        .templates('./views/login.html')
                        .render({
                            dir: global.dir,
                            action: req.req.url,
                            msg: req.query.msg ? msgs[req.query.msg] : null
                        }));
            }
        });

        fastify.route({
            method: 'POST',
            url: '/login',
            handler: async (req, res) => {

                // Get user from ACL.
                var user_db = await fastify.pg.users.connect();
                var result = await user_db.query(
                    `SELECT * FROM ${user_table} WHERE lower(email) = lower($1);`,
                    [req.body.email]
                );
                user_db.release();

                const user = result.rows[0];

                if (!user) {
                    return res.redirect(global.dir + '/login?msg=fail');
                }

                if (!user.verified || !user.approved) {

                    // Sent fail mail.
                    require('./mailer')({
                        to: user.email,
                        subject: `A failed login attempt was made on ${req.headers.host}${global.dir}`,
                        text: `${user.verified ? 'The account is verified. \n \n' : 'The account is NOT verified. \n \n'}`
                            + `${user.approved ? 'The account is approved. \n \n' : 'The account is NOT approved. \n \n'}`
                            + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                            + `This wasn't you? Please let your manager know. \n \n`
                    });

                    return res.redirect(global.dir + '/login?msg=fail');
                }

                // Check password from post body against encrypted password from ACL.
                if (require('bcrypt-nodejs').compareSync(req.body.password, user.password)) {

                    // Create initial token which expires in 10 seconds.
                    const token = fastify.jwt.sign({
                        email: user.email,
                        verified: user.verified,
                        approved: user.approved,
                        admin: user.admin,
                        access: user.admin ? 'admin' : 'private'
                    }, { expiresIn: 10 });

                    // attach token to redirect from query
                    if (req.query.redirect) {
                        let url = req.req.url.replace(global.dir + '/login?redirect=', ''),
                            sign = url.indexOf('?') === -1 ? '?' : '&';
                        return res.redirect(url + sign + 'token=' + token);
                    }

                    // attach token
                    return res.redirect(req.req.url
                        .replace('login?', '?token=' + token + '&')
                        .replace('login', '?token=' + token)
                        .replace('/?', '?'));

                } else {

                    // Password does NOT match.
                    var user_db = await fastify.pg.users.connect();
                    var result = await user_db.query(`
                        UPDATE ${user_table} SET failedattempts = failedattempts + 1
                        WHERE lower(email) = lower($1)
                        RETURNING failedattempts;`,
                        [req.body.email]);
                    user_db.release();

                    // Check whether failed login attempts exceeds limit.
                    if (result.rows[0].failedattempts >= global.failed_attempts) {

                        // Create a new verification token and remove verified status in ACL.
                        const verificationtoken = require('crypto').randomBytes(20).toString('hex');
                        var user_db = await fastify.pg.users.connect();
                        await user_db.query(`
                            UPDATE ${user_table} SET
                                verified = false,
                                verificationtoken = '${verificationtoken}'
                            WHERE lower(email) = lower($1);`,
                            [req.body.email]);
                        user_db.release();

                        // Sent email with verification link to user.
                        require('./mailer')({
                            to: user.email,
                            subject: `Too many failed login attempts occured on ${req.headers.host}${global.dir}`,
                            text: `${global.failed_attempts} failed login attempts have been recorded on this account. \n \n`
                                + `This account has now been locked until verified. \n \n`
                                + `Please verify that you are the account holder: https://${req.headers.host}${global.dir}/admin/user/verify/${verificationtoken} \n \n`
                                + `Verifying the account will reset the failed login attempts. \n \n`
                                + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                                + `This wasn't you? Please let your manager know. \n \n`
                        });

                    } else {
                        // Sent fail mail.
                        require('./mailer')({
                            to: user.email,
                            subject: `A failed login attempt was made on ${req.headers.host}${global.dir}`,
                            text: `An incorrect password was entered! \n \n`
                                + `The failed attempt occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                                + `This wasn't you? Please let your manager know. \n \n`
                        });
                    }

                    return res.redirect(global.dir + '/login?msg=fail');

                }
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
                        .render({ dir: global.dir }));
            }
        });

        fastify.route({
            method: 'POST',
            url: '/register',
            handler: async (req, res) => {

                const email = req.body.email;

                // Backend validation of email address.
                if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {

                    return res.redirect(global.dir + '/login?msg=validation');
                }

                var user_db = await fastify.pg.users.connect();
                result = await user_db.query(
                    `SELECT * FROM ${user_table} WHERE lower(email) = lower($1);`,
                    [email]
                );
                user_db.release();

                const user = result.rows[0];
                const password = require('bcrypt-nodejs').hashSync(req.body.password, require('bcrypt-nodejs').genSaltSync(8));
                const verificationtoken = require('crypto').randomBytes(20).toString('hex');

                // set password for existing user and remove existing verification.
                if (user) {
                    var user_db = await fastify.pg.users.connect();
                    await user_db.query(`
                        UPDATE ${user_table} SET
                            password_reset = '${password}',
                            verificationtoken = '${verificationtoken}'
                        WHERE lower(email) = lower($1);`, [email]);
                    user_db.release();

                    require('./mailer')({
                        to: user.email,
                        subject: `Please verify your password reset for ${req.headers.host}${global.dir}`,
                        text: `A new password has been set for this account. \n \n`
                            + `Please verify that you are the account holder: https://${req.headers.host}${global.dir}/admin/user/verify/${verificationtoken} \n \n`
                            + `The reset occured from this remote address ${req.req.connection.remoteAddress} \n \n`
                            + `This wasn't you? Please let your manager know. \n \n`
                    });

                    return res.redirect(global.dir + '/login?msg=validation');
                }

                // Create new user account
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
                    subject: `Please verify your account on ${req.headers.host}${global.dir}`,
                    text: `A new account for this email address has been registered with ${req.headers.host}${global.dir} \n \n`
                        + `Please verify that you are the account holder: https://${req.headers.host}${global.dir}/admin/user/verify/${verificationtoken} \n \n`
                        + `A site administrator must approve the account before you are able to login. \n \n`
                        + `You will be notified via email once an adimistrator has approved your account. \n \n`
                        + `The account was registered from this remote address ${req.req.connection.remoteAddress} \n \n`
                        + `This wasn't you? Do NOT verify the account and let your manager know. \n \n`

                });

                return res.redirect(global.dir + '/login?msg=validation');
            }
        });

        // Open the user admin panel with a list of all user accounts.
        fastify.route({
            method: 'GET',
            url: '/admin/user',
            beforeHandler: fastify.auth([fastify.authAdmin]),
            handler: async (req, res) => {

                // Get user list from ACL.
                var user_db = await fastify.pg.users.connect();
                let result = await user_db.query(`
                    SELECT
                        email,
                        verified,
                        approved,
                        admin,
                        failedattempts
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
            url: '/admin/user/update',
            beforeHandler: fastify.auth([fastify.authAdminAPI]),
            handler: async (req, res) => {

                // Get user to update from ACL.
                var user_db = await fastify.pg.users.connect();
                let update = await user_db.query(`
                    UPDATE ${user_table} SET ${req.body.role} = ${req.body.chk}
                    WHERE lower(email) = lower($1);`, [req.body.email]);
                user_db.release();

                // Send email to the user account if an account has been approved.
                if (req.body.role === 'approved' && req.body.chk)
                    await require('./mailer')({
                        to: req.body.email,
                        subject: `This account has been approved for ${req.headers.host}${global.dir}`,
                        text: `You are now able to log on to https://${req.headers.host}${global.dir}`
                    });

                if (update.rowCount === 0) res.code(500).send();
                if (update.rowCount === 1) res.code(200).send();
            }
        });

        // Endpoint for deleting user accounts from admin panel.
        fastify.route({
            method: 'POST',
            url: '/admin/user/delete',
            beforeHandler: fastify.auth([fastify.authAdminAPI]),
            handler: async (req, res) => {

                // Delete user account in ACL.
                var user_db = await fastify.pg.users.connect();
                let update = await user_db.query(`
                    DELETE FROM ${user_table}
                    WHERE lower(email) = lower($1);`, [req.body.email]);
                user_db.release();

                if (update.rowCount === 0) res.code(500).send();
                if (update.rowCount === 1) {

                    // Sent email to inform user that their account has been deleted.
                    await require('./mailer')({
                        to: req.body.email,
                        subject: `This ${req.headers.host}${global.dir} account has been deleted.`,
                        text: `You will no longer be able to log in to https://${req.headers.host}${global.dir}`
                    });

                    res.code(200).send()
                };

            }
        });

        // Check verification token and verify account
        fastify.route({
            method: 'GET',
            url: '/admin/user/verify/:token',
            handler: async (req, res) => {

                // Find user account in ACL from matching token.
                var user_db = await fastify.pg.users.connect();
                var result = await user_db.query(
                    `SELECT * FROM ${user_table} WHERE verificationtoken = $1;`,
                    [req.params.token]
                );
                user_db.release();

                const user = result.rows[0];

                if (!user) return res.send('Token not found.');

                if (user.password_reset) {
                    var user_db = await fastify.pg.users.connect();
                    await user_db.query(`
                        UPDATE ${user_table} SET
                            verified = true,
                            password = '${user.password_reset}'
                        WHERE lower(email) = lower($1);`, [user.email]);
                    user_db.release();
                    return res.redirect(global.dir + '/login?msg=reset');
                }

                if (user.verified && user.admin) return res.redirect(global.dir || '/');

                if (user.verified) return res.send('User account is verfied but still awaiting administrator approval.');

                if (!user.approved) {
                    let approvaltoken = require('crypto').randomBytes(20).toString('hex');

                    var user_db = await fastify.pg.users.connect();
                    await user_db.query(`
                        UPDATE ${user_table} SET
                            verified = true,
                            failedattempts = 0,
                            approvaltoken = '${approvaltoken}'
                        WHERE lower(email) = lower($1);`, [user.email]);
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
                        text: `Please log into the admin panel https://${req.headers.host}${global.dir}/admin/user to approve ${user.email} \n \n`
                            + `You can also approve the account by following this link: https://${req.headers.host}${global.dir}/admin/user/approve/${approvaltoken}`
                    });
                }

                var user_db = await fastify.pg.users.connect();
                await user_db.query(`
                    UPDATE ${user_table} SET
                        verified = true,
                        failedattempts = 0
                    WHERE lower(email) = lower($1);`, [user.email]);
                user_db.release();

                if (user.approved) return res.redirect(global.dir || '/');

                res.send('The account has been verified and is awaiting administrator approval.');
            }
        });

        // Check verification token and approve account
        fastify.route({
            method: 'GET',
            url: '/admin/user/approve/:token',
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
                await user_db.query(`
                    UPDATE ${user_table} SET
                        approved = true,
                        approvaltoken = '${user.approvaltoken}'
                    WHERE lower(email) = lower($1);`, [user.email]);
                user_db.release();

                require('./mailer')({
                    to: user.email,
                    subject: `This account has been approved on ${req.headers.host}${global.dir}`,
                    text: `You are now able to log on to https://${req.headers.host}${global.dir}`
                });

                res.send('The account has been approved by you. An email has been sent to the account holder.');
            }
        });

        // Check verification token and approve account
        fastify.route({
            method: 'GET',
            url: '/token/renew',
            handler: async (req, res) => {
                fastify.jwt.verify(req.query.token, (err, token) => {
                    if (err) {
                        fastify.log.error(err);
                        return res.redirect(global.dir + '/login');
                    }
                    delete token.iat;
                    delete token.exp;
                    res.send(fastify.jwt.sign(token, { expiresIn: 90 }));
                });
            }
        });

        next();
 
    }, { prefix: global.dir });
}

function authToken(req, res, fastify, access, done) {

    // Public access
    if (access.lv === 'public') {
        req.query.token = req.query.token && req.query.token !== 'null' ? req.query.token : null;
        return done();
    }

    // No token found.
    if (!req.query.token) {

        // Do not redirect API calls.
        if (access.API) return res.code(401).send();

        // Redirect to login with request URL as redirect parameter
        return res.redirect(global.dir + '/login?redirect=' + req.req.url);
    }

    // Verify token (checks token expiry)
    fastify.jwt.verify(req.query.token, (err, token) => {
        if (err) {
            fastify.log.error(err);
            return res.code(401).send();
        }

        // Check admin privileges.
        if (access.lv === 'admin' && !token.admin) {

            // Do not redirect API calls.
            if (access.API) return res.code(401).send();

            // Redirect to login.
            return res.redirect(global.dir + '/login?msg=fail');
        }

        // Check whether account in token is valid.
        if (!token.email || !token.verified || !token.approved) {

            // Do not redirect API calls.
            if (access.API) return res.code(401).send();

            // Redirect to login.
            return res.redirect(global.dir + '/login');
        }

        done();
    });
}