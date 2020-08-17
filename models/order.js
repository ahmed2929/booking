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
    cart:{
        type:Object
    },
    payment:{
        type:schema.Types.ObjectId,
        ref:'payment'
    },
    address:{
        type:String
    },
    delivaryStatus:{
        type:Boolean,
        default:false
    }

    
    
}, {timestamps:true});

module.exports = mongoose.model('order',orderSchema);