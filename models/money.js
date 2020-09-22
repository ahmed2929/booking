const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const moneySchema = new schema({
   type:{
       type:String,
       enum:['shop','market']
   },
   TotalElec:{
       type:Number,
       default:0
   },
   TotalCach:{
       type:Number,
       default:0
   }


    
    
}, {timestamps:true});

module.exports = mongoose.model('money',moneySchema);