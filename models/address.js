const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const addressScheam = new schema({
 
       N:{
           type:String,
       },
       E:{
        type:String 
       }
   ,
   title:{
    type:String
},
address:{
    type:String

}


    
    
}, {timestamps:true});

module.exports = mongoose.model('address',addressScheam);