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
    MyWonAds:[{ 
        
            type:schema.Types.ObjectId,
            ref:'ads'
             
    }],
    RecivedRequest:[{
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
    img:{
     type:String,
     default:''
    },
    EmailActiveCode:String,
    phoneActiveCode:String
    ,
    forgetPasswordCode:String,
    codeExpireDate:Date,
    Adress:String,
    status:{
        type:String,
        default:'treder'
       },
    lang:{
        type:Number,
        default:0
    },
    cart:[{
        type:schema.Types.ObjectId,
        ref:'product'

    }]
});

module.exports = mongoose.model('TrederUser',userSchema);