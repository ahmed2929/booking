const Port=3000;
const express=require('express');
const mongoose=require('mongoose');
const multer    = require('multer');
const path      = require('path');

const services=require('./models/AvilableServices')




const configMiddleware=require('./midllewares/config');
var app=express();
var localDB='mongodb://localhost/Booking-local2'
var remoteDB='mongodb+srv://AK:a01129292532@cluster0.uf0py.mongodb.net/booking?retryWrites=true&w=majority'
mongoose.connect(remoteDB,{ useNewUrlParser: true,useUnifiedTopology: true },()=>{

    console.log('db connected');

    const server=app.listen(process.env.PORT||4000);
    require('./socket.io.settings').init(server)
   
     

})



//const path=require('path');
//const multer=require('multer')


 var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,'images')
    },
    filename: function (req, file, cb) {
      cb(null,Date.now()+'-'+file.originalname)
    }
  })

  const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/png'||
    file.mimetype==='image/jpg'   ||
    file.mimetype==='image/jpeg'  ){
        console.debug('it image')

        cb(null,true);
    }else {
        console.debug('else run')
      cb(new Error('In correct type'));
    }
  }
   
 //app.use(multer({ storage: storage,fileFilter:fileFilter }).array('image'))




app.use(express.static('images'))
app.use('/images',express.static(path.join(__dirname,'images')));

app=configMiddleware(app);







