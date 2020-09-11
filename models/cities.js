const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const citeiesScheam = new schema({
   name:{
       type:String
   },
   arb_name:{
    type:String
}


    
    
}, {timestamps:true});

module.exports = mongoose.model('cities',citeiesScheam);