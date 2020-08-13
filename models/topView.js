const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const topView = new schema({
ad:{
    type:schema.Types.ObjectId,
    ref:'ads'
},
position:{
    type:Number
}

});

module.exports = mongoose.model('topview',topView);