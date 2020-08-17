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
            type: String,
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
    mobile:{
        type:String,
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
    name:String,
    email:String,
    photo:{
      type:String,
      default:'https://img.icons8.com/bubbles/50/000000/user-male.png'
    },
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
        product:{type:schema.Types.ObjectId,
        ref:'product'
        },
        numberNeeded:{
          type:Number,
          default:1,
        }
    }]
});

module.exports = mongoose.model('CustomerUser',userSchema);