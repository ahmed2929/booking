const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const Productchema = new schema({
    Creator:{
        type:schema.Types.ObjectId,
        ref:'admin'
    },
    images:[
        {
            url:String
        }
    ],
    catigory:[{
        type:schema.Types.ObjectId,
        ref:'shopcatigory'
    }],
    price:Number,
    desc:String,
    tiltle:String
    
}, {timestamps:true});

module.exports = mongoose.model('product',Productchema);