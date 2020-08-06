const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const serviceschema = new schema({
name:String
});

module.exports = mongoose.model('services',serviceschema);