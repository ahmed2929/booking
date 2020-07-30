var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
  auth: {
    api_key: 'key-1234123412341234',
    domain: 'sandbox3249234.mailgun.org'
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports={
    nodemailerMailgun
}