const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const servicesSchema = new schema({
    name:String,
});

module.exports = mongoose.model('services',servicesSchema);