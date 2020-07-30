const Port=3000;
const express=require('express');
const mongoose=require('mongoose');
const configMiddleware=require('./midllewares/config');
var app=express();

mongoose.connect('mongodb+srv://AK:a01129292532@cluster0.uf0py.mongodb.net/booking?retryWrites=true&w=majority',{ useNewUrlParser: true,useUnifiedTopology: true },()=>{
    console.log('db connected');

    const server=app.listen(process.env.Port||3000);
    require('./socket.io.settings').init(server)
   
     

})



app=configMiddleware(app);







