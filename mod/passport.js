const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const user = require('./user');
const mailer = require('./mailer');

passport.serializeUser(function (_user, done) {
    done(null, _user.id);
});

passport.deserializeUser(function (id, done) {
    user.findById(id, function (err, _user) {
        done(err, _user);
    });
});

passport.use('localLogin', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        user.findOne({'email': email}, function (err, _user) {
            if (err) return done(err);
            if (!_user) return done(null, false);
            if (!_user.validPassword(password)) return done(null, false);
            return done(null, _user);
        });
    }));

passport.use('localRegister', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        process.nextTick(function () {
            user.findOne({'email': email}, function (err, _user) {
                if (err) {
                    return done(err);
                }
                if (_user) {
                    return done(null, false);
                } else {
                    let newUser = new user();
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.verified = false;
                    newUser.approved = false;
                    newUser.admin = false;
                    newUser.verificationToken = require('crypto').randomBytes(20).toString('hex');
                    newUser.verificationTokenExpires = Date.now() + 3600000;
                    newUser.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        mailer.mail({
                            to: newUser.email,
                            subject: 'Please verify your GEOLYTIX account',
                            text: 'Click here to verify account: https://' + process.env.HOST + '/' + process.env.SUBDIRECTORY + '/verify/' + newUser.verificationToken
                        });
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

module.exports = passport;
