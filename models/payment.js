const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const RequestSchema = new schema({
    Cuser:{
        type:schema.Types.ObjectId,
        ref:'CustomerUser'
    },
    Tuser:{
        type:schema.Types.ObjectId,
        ref:'TrederUser'
    },
    methodOfPay:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        default:0
    },
    totalMoney:{
        type:Number,
        required:true
    },
    finalPrice:Number,
    descPerc:{
       type: Number,
       default:0
    }
    
}, {timestamps:true});

module.exports = mongoose.model('payment',RequestSchema);