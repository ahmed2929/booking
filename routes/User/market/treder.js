const express=require('express');
const Router=express.Router();
const {body} =require('express-validator')  
const { json } = require('body-parser');
const verfiyToken=require('../../../helpers/Auth/TrederAuth')
const uploadImage=require('../../../helpers/uploadImage');
const bodyParser = require('body-parser');
const conttroller=require('../../../controllers/market/treder')
Router.put('/createApartment',verfiyToken,uploadImage.array('image'),conttroller.CreateAppartment);



Router.put('/editApartment',verfiyToken,uploadImage.array('image'),[
   
   body('ADId')
   .not()
   .isEmpty()

],conttroller.editAdById);

Router.delete('/deleteApartment',verfiyToken,uploadImage.array('image'),[
   
    body('ADId')
    .not()
    .isEmpty()
 
 ],conttroller.deleteById); 
Router.get('/getMyADs',verfiyToken,conttroller.getMyADs)
Router.get('/getAllRequests',verfiyToken,conttroller.getAllRequests)
Router.get('/getRequestbyId/:RequestId',verfiyToken,conttroller.getRequestbyId)
Router.post('/acceptRequest',verfiyToken,conttroller.acceptRequest)
Router.post('/DisAgreeRequest',verfiyToken,conttroller.disAgree)






module.exports=Router
