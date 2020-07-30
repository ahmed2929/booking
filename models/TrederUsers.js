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
        ADS:{
            type:schema.Types.ObjectId,
            ref:'ADS'
        }      
    }],
    RecivedRequest:[{
        type:schema.Types.ObjectId,
        ref:'Request'
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