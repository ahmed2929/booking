const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const ADSchema = new schema({
    Creator:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    country:{
       type:String,
       default:'UAE'
    
    }
        ,
    city:String,
    streetAdress:String,
    details:String,
    title:String,
    catigory:{
      type:schema.Types.ObjectId,
      ref:'catigory' 
    },
    services:[{
        serviceType:{
            type:schema.Types.ObjectId,
            ref:'services' 
        },
        price:Number
    }],
    
    images:[
        {
            type:String
        }
    ],
    price:Number,
    Rate:[{
        user:{
            type:schema.Types.ObjectId,
            ref:'CustomerUser'
    },
    userRate:Number,
    date:{
        type:Date, 
    }
    }],
    star:{
       type: Number,
       default:0
    },
    NumOfRooms:Number,
    beds:Number,
    beach:Boolean,
    
    GPS:{
        N:{
            type:String
        },
        E:{
            type:String
        }
    },
    NotAvilable:[{
        startDate:{
            type:Date
        },
        EndDate:{
            type:Date
        },
        requestId:{
            type:schema.Types.ObjectId,
            ref:'request'
        }
    }]
    
}, {timestamps:true});

module.exports = mongoose.model('ads',ADSchema);