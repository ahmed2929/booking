const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const issuesSchema = new schema({
    status:{
       type: Number,
       default:0,
    },
    Cuser:{
        type:schema.Types.ObjectId,
        ref:'CustomerUser'
    },
    Tuser:{
        type:schema.Types.ObjectId,
        ref:'TrederUser'
    },
    message:{
        type:String,
        required:true
    },
    answer:{
        type:String,
       
    }


    
    
}, {timestamps:true});

module.exports = mongoose.model('isuues',issuesSchema);