const express=require('express');
const bodyParser=require('body-parser');
const path      = require('path');
const multer    = require('multer');

const authCustomer=require('../routes/User/auth/customer/customeruser')
const authTreder=require('../routes/User/auth/treder/trederuser')
const socialmediaCustomer=require('../routes/User/auth/socialMedia/customer')
const socialmediaTreder=require('../routes/User/auth/socialMedia/treder')
const marketTreder=require('../routes/User/market/treder')
const marketcustomer=require('../routes/User/market/customer')
const admin=require('../routes/admin/admin')
const shop=require('../routes/shop/shop')

const generalMargetRoutes=require('../routes/User/market/general')


const socket=require('../controllers/HandleSocketConnection/handleEvents')
module.exports=(app)=>{ 
   // meddlewares
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({extended:true}));
   require('dotenv').config();
   
  //app.use('/static', express.static(path.join(__dirname, 'public')))

   app.get('/',(req,res)=>{
      res.send('welcome please read the docs')
   })

   // end medllewares 

   
  // routes set


   app.use('/auth/user/customer',authCustomer);
   app.use('/auth/user/treder',authTreder);
   app.use('/auth/socialmedia/customer',socialmediaCustomer)
   app.use('/auth/socialmedia/treder',socialmediaTreder)
   app.use('/market/treder',marketTreder)
   app.use('/market/customer',marketcustomer)
   app.use('/market/general',generalMargetRoutes)
   app.use('/shop/',shop)
   app.use('/admin',admin)
  


   // end routes

//app.use(socket);

//error handle meddlewere
app.use((error,req,res,next)=>{
   console.debug('general error runs')
   const status    = error.statusCode || 500 ;
   const message   = error.message           ;
   const data      = error.data              ;
   
   res.status(status).json({state:0,message:message,data:data});
});

// end error hanle
return app;
}
