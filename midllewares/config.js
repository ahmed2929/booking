const express=require('express');
const bodyParser=require('body-parser');

const authCustomer=require('../routes/User/auth/customer/CustomerUser')
const authTreder=require('../routes/User/auth/treder/Trederuser')

const socket=require('../controllers/HandleSocketConnection/handleEvents')
module.exports=(app)=>{ 
   app.use(bodyParser.json());
   require('dotenv').config();
   app.get('/',(req,res)=>{
      res.send('welcome please read the docs')
   })
   app.use('/auth/user/customer',authCustomer);
   app.use('/auth/user/treder',authTreder);
//app.use(socket);

//error handle meddlewere
app.use((error,req,res,next)=>{
   console.debug('general error runs')
   const status    = error.statusCode || 500 ;
   const message   = error.message           ;
   const data      = error.data              ;
   
   res.status(status).json({state:0,message:message,data:data});
});

return app;
}
