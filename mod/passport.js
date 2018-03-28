const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const user = require('./user');
const mailer = require('./mailer');

passport.serializeUser((_user, done) => done(null, _user.id));

passport.deserializeUser((id, done) => user.findById(id, (err, _user) => done(err, _user)));

passport.use('localLogin',
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        user.findOne({ 'email': email }, (err, _user) => {
            if (err) return done(err)
            if (!_user) return done(null, false)
            if (!_user.validPassword(password)) return done(null, false);

            return done(null, _user);
        });
    }));

passport.use('localRegister',
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        process.nextTick(() => {
            user.findOne({ 'email': email }, (err, _user) => {
                if (err) return done(err);
                if (_user) return done(null, false);

                let newUser = new user();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.verified = false;
                newUser.approved = false;
                newUser.admin = false;
                newUser.verificationToken = require('crypto').randomBytes(20).toString('hex');
                newUser.verificationTokenExpires = Date.now() + 3600000;

                newUser.save((err) => {
                    if (err) throw err;

                    let site = (process.env.HOST || ('localhost:' + (process.env.PORT || '3000'))) + process.env.DIR

                    mailer.mail({
                        to: newUser.email,
                        subject: 'Please verify your GEOLYTIX account',
                        text: `
                        An account for this email has been registered with ${site}.
                        Click here to verify account: ' + req.protocol + '://' + (process.env.HOST || 'localhost:3000') + (process.env.DIR || '') + '/verify/' + newUser.verificationToken
                        `
                    });

                    return done(null, newUser);
                });
            });
        });
    }));

module.exports = passport;
