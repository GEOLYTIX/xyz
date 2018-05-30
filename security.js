const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const mailer = require('./mod/mailer');

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

passport.use(
    'localLogin',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            let user = await global.ORM.collections.users.findOne({ email: email });
            bcrypt.compareSync(password, user.password) ?
                done(null, user) :
                done(null, false);
        }
    )
);

passport.use(
    'localRegister',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {

            let user = await global.ORM.collections.users.findOne({ email: email });

            // set password for existing user and remove existing verification.
            if (user) {
                user = await global.ORM.collections.users.update({ email: email })
                    .set({
                        verified: false,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
                        verificationToken: require('crypto').randomBytes(20).toString('hex'),
                        verificationTokenExpires: Date.now() + 3600000
                    })
                    .fetch();

                user = user[0];

                mailer.mail({
                    to: user.email,
                    subject: `Please verify your GEOLYTIX account (password reset) on ${global.site}`,
                    text: `A new password has been set for this account.
                    
                    Please verify that you are the account holder: ${req.protocol}://${global.site}/verify/${user.verificationToken}`
                });

                return done(null, user);
            }

            // create new user if no existing user is found for email address.
            if (!user) {

                user = {
                    email: email,
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
                    verified: false,
                    approved: false,
                    admin: false,
                    verificationToken: require('crypto').randomBytes(20).toString('hex'),
                    verificationTokenExpires: Date.now() + 3600000
                }

                user = await global.ORM.collections.users.create(user).fetch();

                mailer.mail({
                    to: user.email,
                    subject: `Please verify your GEOLYTIX account on ${global.site}`,
                    text: `A new account for this email address has been registered with ${global.site}.
                    
                    Please verify that you are the account holder: ${req.protocol}://${global.site}/verify/${user.verificationToken}
                    
                    A site administrator must approve the account before you are able to login.
                
                    You will be notified via email once an adimistrator has approved your account.`});

                return done(null, user);
            }
        }
    )
);

async function verify(req, res) {

    // Find user account from matching token and timestamp.
    let user = await global.ORM.collections.users.findOne({ verificationToken: req.params.token });

    // Return if user account is not found.
    if (!user) return res.send('Token not found.');

    // Return if user account is not found.
    if (user.verified) return res.send('User account has already been verfied.');

    if (Date.now() > user.verificationTokenExpires) return res.send('The verification token has expired.');

    user = await global.ORM.collections.users
        .update({ email: user.email })
        .set({
            verified: true,
            verificationToken: require('crypto').randomBytes(20).toString('hex'),
            verificationTokenExpires: Date.now() + 3600000
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
        text: `Please log into the admin panel to approve ${user.email}
            
            You can also approve the account by following this link: ${req.protocol}://${global.site}/approve/${user.verificationToken}`
    });

    // Update session messages and send success notification to client.
    req.session.messages = ['An email has been sent to the site administrator'];
    res.send('The account has been verified and is awaiting administrator approval.');
}

async function approve(req, res) {

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

async function update_user(req, res) {

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

async function delete_user(req, res) {

    // Find user by email and set role.
    user = await global.ORM.collections.users
        .destroy({ email: req.body.email })
        .fetch();

    user = user[0];

    // Return if no user account is found.
    if (!user) return res.json({ delete: false });

    res.json({ delete: true });
}

module.exports = {
    passport: passport,
    verify: verify,
    approve: approve,
    update_user: update_user,
    delete_user: delete_user
}