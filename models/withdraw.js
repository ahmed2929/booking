const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const withdrawSchema = new schema({
user:{
    type:schema.Types.ObjectId,
    ref:'TrederUser',
    required:true
},
TotalWalletMoney:{
    type:Number,
    required:true,
    default:0
},
RequiredWithdrowMoney:{
type:Number,
default:0,
required:true
},
FullName:{
    type:String,
    required:true
    },
Address:{
        type:String,
        required:true
},
BankName:{
    type:String,
    required:true
},
AccountNumber:{
    type:String,
    required:true
},
BankCode:{
    type:String,
    required:true
},
MobileNumber:{
    type:String,
    required:true
},
Email:{
    type:String,
    required:true
},

RequestStatus:{
    type:Number,
    required:true,
    enum: [0,1,2], //0 not acespted 1 pending 2 done
    default:0

}





},{timestamps:true});

module.exports = mongoose.model('withdraw',withdrawSchema);