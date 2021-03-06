const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const Productchema = new schema({
   images:[
        {
           type:String
        }
    ],
   catigory:{
        type:schema.Types.ObjectId,
        ref:'shopcatigory'
    },
    price:Number,
    desc:String,
    title:String,
    avilableNumber:Number,
    sold:{
        type:Number,
        default:0
    }
    
}, {timestamps:true});

module.exports = mongoose.model('product',Productchema);