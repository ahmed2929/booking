const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const ADSchema = new schema({
    Creator:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    images:[
        {
            url:String
        }
    ],
    address:String,
    catigory:[{
        type:schema.Types.ObjectId,
        ref:'catigory'
    }],
    services:[{
        name:String,
        price:Number
    }],
    price:Number,
    Rate:[{
        user:{
            type:schema.Types.ObjectId,
        ref:'catigory'
    },
    star:Number

    }],
    NumOfRooms:Number,
    
}, {timestamps:true});

module.exports = mongoose.model('ads',ADSchema);