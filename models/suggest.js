const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const sugest = new schema({
    Cuser:{
        type:schema.Types.ObjectId,
        ref:'CustomerUser'
    },
    Tuser:{
        type:schema.Types.ObjectId,
        ref:'TrederUser'
    },
    suggest:{
        type:String,
        required:true
    }

    
    
}, {timestamps:true});

module.exports = mongoose.model('sugest',sugest);