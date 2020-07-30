const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const RequestSchema = new schema({
    user:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    product:{
        type:schema.Types.ObjectId,
        ref:'product'
    },
    status:{
        type:Number,
        default:0
    }
    
}, {timestamps:true});

module.exports = mongoose.model('request',RequestSchema);