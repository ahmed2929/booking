const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const RequestSchema = new schema({
    from:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    to:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    data:{
        startDate:schema.Types.Date,
        endDate:schema.Types.Date,
        NumOfRooms:Number,
        Services:[{
            name:String,
            price:Number,
            numOfItems:Number,

        }],
        finalPrice:Number,
        status:{
            type:Number,
            default:0
        },
        Adult:Number,
        kids:Number
    }
    
}, {timestamps:true});

module.exports = mongoose.model('request',RequestSchema);