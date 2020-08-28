const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const catigorytchema = new schema({
  
 name:{
     type:String,
     required:true,
 },
 arb_name:{
    type:String,
    required:true,
 },
 products:[{
    type:schema.Types.ObjectId,
    ref:'product'
 }]
    
}, {timestamps:true});

module.exports = mongoose.model('shopcatigory',catigorytchema);