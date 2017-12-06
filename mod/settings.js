module.exports = function(){
    let mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB,{useMongoClient: true});
    let mongooseSchema = mongoose.Schema;
    let mongooseModel = mongoose.model("mongooseModel", new mongooseSchema({}), "settings");
    return mongooseModel.find();
};