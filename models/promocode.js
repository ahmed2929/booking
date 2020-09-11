const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const promoSchema = new schema({
    name:{
        type:String,
        required:true
    },
    descPercent:{
        type:Number,
        required:true
    }
    
}, {timestamps:true});

module.exports = mongoose.model('promoSchema',promoSchema);