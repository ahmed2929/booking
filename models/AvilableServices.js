const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const serviceschema = new schema({
name:{
    type:String,
    required:true
 },
 arb_name:{
   type:String,
   required:true
},
image:{
   type:String,
   required:true
}
});

module.exports = mongoose.model('services',serviceschema);