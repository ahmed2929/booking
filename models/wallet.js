const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const walletSchema = new schema({
   TotalPrice:{
       type:Number,
       required:true,
       default:0
   },
currency:{
    type:String,
    default:'AED'

}
    
    ,

withDarwRequest:[{
    type:schema.Types.ObjectId,
    ref:'withdraw'
}],
user:{
    type:schema.Types.ObjectId,
    ref:'TrederUser',
}


});

module.exports = mongoose.model('wallet',walletSchema);