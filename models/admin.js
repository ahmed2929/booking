const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const adminSchema = new schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    forgetPasswordCode:String,
    codeExpireDate:Date,
    Adress:String,
    lang:String
});

module.exports = mongoose.model('admin',adminSchema);