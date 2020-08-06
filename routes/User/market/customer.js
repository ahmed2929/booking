const express=require('express');
const Router=express.Router();
const {body,sanitize,check} =require('express-validator')  
const { json } = require('body-parser');
const verfiyToken=require('../../../helpers/Auth/CustomerAuth')
const uploadImage=require('../../../helpers/uploadImage');
const bodyParser = require('body-parser');
const conttroller=require('../../../controllers/market/customer')

Router.put('/createRequest',verfiyToken,[
   
    body('AdId')
    .not()
    .isEmpty(),
    body('EndDate')
    .not()
    .isEmpty(),
    body('StartDate')
    .not()
    .isEmpty(),
    body('Adult')
    .isDecimal(),
    body('children')
    .isDecimal()
    
  
  

],conttroller.Book);

Router.get('/getMyRequests',verfiyToken,conttroller.getMyRequests)
Router.get('/getMyRequests',verfiyToken,conttroller.getMyRequests)
Router.put('/reschedule',verfiyToken,conttroller.reschedule)
Router.post('/Rate',verfiyToken,conttroller.Rate)




module.exports=Router
