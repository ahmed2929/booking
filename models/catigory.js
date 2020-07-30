const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const catigorySchema = new schema({
    name:String,
    ads:[{
        type:schema.Types.ObjectId,
        ref:'ads'
    }]
    
});

module.exports = mongoose.model('catigory',catigorySchema);