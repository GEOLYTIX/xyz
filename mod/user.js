const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;
if (process.env.LOGIN) mongoose.connect(process.env.LOGIN,{useMongoClient: true});

const userSchema = mongoose.Schema({
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

module.exports = mongoose.model('user', userSchema);