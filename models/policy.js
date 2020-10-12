const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const policySchema = new schema({
  policy:{
      type:String
  },
  POLICY_EN:{
    type:String
  }
    
    
}, {timestamps:true});

module.exports = mongoose.model('policy',policySchema);