const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const fqSchema = new schema({
    question:{
        type:String,
       
    },
    answer:{
        type:String,
       
    }


    
    
}, {timestamps:true});

module.exports = mongoose.model('fq',fqSchema);