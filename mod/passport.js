const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mailer = require('./mailer');

let user_model;

passport.use('localLogin',
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {

        let mongoose = require('mongoose'),
            bcrypt = require('bcrypt-nodejs'),
            userSchema = mongoose.Schema({
                email: String,
                password: String,
                verified: Boolean,
                approved: Boolean,
                admin: Boolean,
                verificationToken: String,
                verificationTokenExpires: Date
            });

        userSchema.methods.generateHash = function (password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };

        userSchema.methods.validPassword = function (password) {
            return bcrypt.compareSync(password, this.password);
        };

        if (!user_model) user_model = mongoose.model('user', userSchema);

        passport.serializeUser((_user, done) => done(null, _user.id));

        passport.deserializeUser((id, done) => user_model.findById(id, (err, _user) => done(err, _user)));

        await mongoose.connect(process.env.LOGIN);
        done(null, await user_model.findOne({ 'email': email }));
    }));

passport.use('localRegister',
    new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        process.nextTick(() => {
            user_model.findOne({ 'email': email }, (err, _user) => {

                // return with err.
                if (err) return done(err);

                // set password for existing user and remove existing verification.
                if (_user) {
                    _user.verified = false;
                    _user.password = _user.generateHash(password);
                    _user.verificationToken = require('crypto').randomBytes(20).toString('hex');
                    _user.verificationTokenExpires = Date.now() + 3600000;

                    // update existing user account with new password and verification token.
                    _user.save((err) => {
                        if (err) throw err;
     
                        // sent mail with verification link.
                        mailer.mail({
                            to: _user.email,
                            subject: `Please verify your GEOLYTIX account (password reset) on ${global.site}`,
                            text: `A new password has been set for this account.
                            
                            Please verify that you are the account holder: ${req.protocol}://${global.site}/verify/${_user.verificationToken}`
                        });
    
                        return done(null, _user);
                    });
                }

                // create new user if no existing user is found for email address.
                if (!_user) {
                    let newUser = new user();
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.verified = false;
                    newUser.approved = false;
                    newUser.admin = false;
                    newUser.verificationToken = require('crypto').randomBytes(20).toString('hex');
                    newUser.verificationTokenExpires = Date.now() + 3600000;
    
                    // save new user account.
                    newUser.save((err) => {

                        // return with err.
                        if (err) throw err;
        
                        // sent mail with verification link.
                        mailer.mail({
                            to: newUser.email,
                            subject: `Please verify your GEOLYTIX account on ${global.site}`,
                            text: `A new account for this email address has been registered with ${global.site}.
                            
                            Please verify that you are the account holder: ${req.protocol}://${global.site}/verify/${newUser.verificationToken}
                            
                            A site administrator must approve the account before you are able to login.
                            
                            You will be notified via email once an adimistrator has approved your account.`
                        });
    
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

module.exports = passport;