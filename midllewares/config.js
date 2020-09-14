const express=require('express');
const bodyParser=require('body-parser');
const path      = require('path');
const multer    = require('multer');
const AppAdmin=require('../routes/admin/admin')
const authCustomer=require('../routes/User/auth/customer/CustomerUser')
const authTreder=require('../routes/User/auth/treder/Trederuser')
const socialmediaCustomer=require('../routes/User/auth/socialMedia/customer')
const socialmediaTreder=require('../routes/User/auth/socialMedia/treder')
const marketTreder=require('../routes/User/market/treder')
const marketcustomer=require('../routes/User/market/customer')
const admin=require('firebase-admin')
const shop=require('../routes/shop/shop')
const payment=require('../routes/payment/payment')
request = require('request');
const SearchApi=require('../controllers/general/general').Search
const generalMargetRoutes=require('../routes/User/market/general')
var cors = require('cors')


const socket=require('../controllers/HandleSocketConnection/handleEvents')
module.exports=(app)=>{ 
   // meddlewares
   app.use(cors())
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({extended:true}));
   require('dotenv').config();
   
   admin.initializeApp({
      credential: admin.credential.cert({
        
        clientEmail: process.env.FCM_CLINT_EMAIL,
        privateKey:  process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
        projectId:   process.env.FCM_PROJ_ID ,
  
    }),
  });
  







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
   app.use('/admin',AppAdmin)
   app.use('/search',SearchApi)
   app.use('/payment',payment)
   
  app.get('/images/*',(req,res)=>{

   request('https://www.tibs.org.tw/images/default.jpg').pipe(res)
   


  })


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
