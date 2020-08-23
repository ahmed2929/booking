const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const userSchema = new schema({
    methods: {
        type: String,
        required: true
      },
      local: {
        email: {
          type: String,
          lowercase: true
        },
        password: {
          type: String
        },
        name:{
            type:String,
            
        },
        
      },
      google: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        },
        name: {
            type: String
          },
          photo:{
            type: String
          }
      },
      facebook: {
        id: {
          type: String
        },
        email: {
          type: String,
          lowercase: true
        }
    },
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
    },
    email:{
        type:String,
        required:true
    },
    photo:{
      type:String,
      default:'https://img.icons8.com/bubbles/50/000000/user-male.png'
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
    notfications:[
      {
        type:schema.Types.ObjectId,
        ref:'notification' 
      }
    ],
    EmailActiveCode:{
      type:String,
      expires: 3600*60
    },
    phoneActiveCode:String
    ,
    forgetPasswordCode:{
      type:String,
      expires: 3600*60
    },
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

    }],
    Orders:[{
      type:schema.Types.ObjectId,
      ref:'order'
    }],
});

module.exports = mongoose.model('TrederUser',userSchema);