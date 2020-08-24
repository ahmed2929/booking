const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const RequestSchema = new schema({
    from:{
        type:schema.Types.ObjectId,
        ref:'CustomerUser'
    },
    to:{
        type:schema.Types.ObjectId,
        ref:'TrederUser'
    },
    AD:{
        type:schema.Types.ObjectId,
        ref:'ads'
    },
    RequestData:{
        StartDate:{
            type:Date
        },
        EndDate:{
            type:Date
        },
        Adult:{
            type:Number
        },
        children:{
            type:Number
        },
        gender:{
            type:String
        },
        services:[
            {
                serviceType:{
                type:schema.Types.ObjectId,
                ref:'services'
                },
                numberWanted:{
                    type:Number
                },
                FinalservicePrice:Number
            }
        ],

        finalPrice:Number,
        ArivalTime:String,
        status:{
            type:Number,
            default:0
            
        }

    },
    refuseMassage:String,
    RateState:{
        status:Number,
        star:Number
    },
    Payment:{
        type:schema.Types.ObjectId,
        ref:'payment'
    }

    
    
}, {timestamps:true});

module.exports = mongoose.model('request',RequestSchema);