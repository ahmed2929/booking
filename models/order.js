const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const orderSchema = new schema({
    Cuser:{
        type:schema.Types.ObjectId,
        ref:'CustomerUser'
    },
    Tuser:{
        type:schema.Types.ObjectId,
        ref:'TrederUser'
    },
    cart:[{
        product:{
            type:schema.Types.ObjectId,
        ref:'product'
        },
        numberNeeded:Number
    }],
    payment:{
        type:schema.Types.ObjectId,
        ref:'payment'
    },
    address:{
        type:schema.Types.ObjectId,
        ref:'address'
    },
    delivaryStatus:{
        type:Boolean,
        default:false
    }

    
    
}, {timestamps:true});

module.exports = mongoose.model('order',orderSchema);