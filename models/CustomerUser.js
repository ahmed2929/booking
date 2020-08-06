const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const userSchema = new schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    emailVerfied:{
        type:Boolean,
        default:false
    },
    mobileVerfied:{
        type:Boolean,
        default:false
    },
    blocked:{
        type:Boolean,
        default:false
    }
    ,
    FCMJwt:[{
        type:String
    }],
    pendingRequestTo:[{
        type:schema.Types.ObjectId,
        ref:'request'
    }],
    notfications:[{
        data:{
            id:String,
            key:String,
            data:String
        },
        notification:{
            title:String,
            body:String
        },
        date:{
            type:String,
            required:true
        }
    }],
    EmailActiveCode:String,
    phoneActiveCode:String
    ,
    forgetPasswordCode:String,
    codeExpireDate:Date,
    Adress:String,
    lang:String,
    status:{
        type:String,
        default:'customer'
       },
    cart:[{
        type:schema.Types.ObjectId,
        ref:'product'

    }]
});

module.exports = mongoose.model('CustomerUser',userSchema);