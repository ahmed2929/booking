const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const notificationSchema = new schema({
    data:{
       type:Object
    },
    notification:{
        title:String,
        body:String
    },
    action:{
        type:String,
    }


    
    
}, {timestamps:true});

module.exports = mongoose.model('notification',notificationSchema);