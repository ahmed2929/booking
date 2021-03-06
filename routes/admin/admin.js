const express=require('express');
const Router=express.Router();
const controller=require('../../controllers/admin/admin')
const {body} =require('express-validator')  
//const admin=require('../../models/admin');
//const { json } = require('body-parser');
const verfiyToken=require('../../helpers/Auth/admin');
const uploadImage=require('../../helpers/uploadImage');
const trederController=require('../../controllers/market/treder')

Router.post('/login',[
body('email')
.not()
.isEmpty(),
body('password')
.not()
.isEmpty(),

],controller.login);

Router.post('/register',[
    body('email')
    .not()
    .isEmpty(),
    body('password')
    .not()
    .isEmpty(),
    
    ],controller.register);

Router.post('/createProductCatigory',[
     body('name')
        .not()
        .isEmpty(),
        body('arb_name')
        .not()
        .isEmpty(),
        
],verfiyToken,controller.createProductCatigory); 

Router.post('/editProductCatigory',[
            body('oldname')
            .not()
        .isEmpty(),
        body('newname')
            .not()
        .isEmpty(),
            
],verfiyToken,controller.editProductCatigory);   
            
            

Router.post('/deleteProductCatigory',[
                body('name')
                .not()
                .isEmpty(),
                
],verfiyToken,controller.deleteProductCatigory);     
                
Router.post('/CreateProduct',uploadImage.array('image'),[
    
    body('title')
    .not()
    .isEmpty(),
    body('details')
    .not()
    .isEmpty(),
    body('price')
    .not()
    .isEmpty(),
    body('CatigoryID')
    .not()
    .isEmpty(),

                    
],verfiyToken,controller.CreateProduct);  
              
Router.post('/editProduct',uploadImage.array('image'),[
    
    body('title')
    .not()
    .isEmpty(),
    body('details')
    .not()
    .isEmpty(),
    body('price')
    .not()
    .isEmpty(),
    body('CatigoryID')
    .not()
    .isEmpty(),

                    
],verfiyToken,controller.editProduct);  


Router.post('/deleteProduct',[
    
    body('produtId')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.deleteById);  

Router.post('/setTopView',[
    
    body('adId')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.setTopView);

Router.post('/deleteFromTopView',[
    
    body('adId')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.deleteFromTopView);

Router.post('/createApprtmentCatigory',[
    
    body('name')
    .not()
    .isEmpty(),
    body('arb_name')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.createApprtmentCatigory); 

Router.post('/EditApprtmentCatigory',[
    
    body('name')
    .not()
    .isEmpty(),
    body('arb_name')
    .not()
    .isEmpty(),
    body('CatId')
    .not()
    .isEmpty()
                    
],verfiyToken,controller.EditApprtmentCatigory); 



Router.post('/blockUser',[
    
    body('userId')
    .not()
    .isEmpty(),
    body('block')
    .not()
    .isEmpty(),
    body('status')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.blockCustomerUser); 
Router.post('/createPromo',[
    
    body('name')
    .not()
    .isEmpty(),
    body('descPercent')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.createPromo); 
Router.post('/editPromo',[
    
    body('name')
    .not()
    .isEmpty(),
    body('descPercent')
    .not()
    .isEmpty(),
    body('PromoId')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.editPromo); 

Router.post('/deletePromo',[
    
    body('PromoId')
    .not()
    .isEmpty()
 
],verfiyToken,controller.deletePromo); 

Router.post('/editFQ',[
    
    body('question')
    .not()
    .isEmpty(),
    body('answer')
    .not()
    .isEmpty(),
    body('FQID')
    .not()
    .isEmpty()
    
                    
],verfiyToken,controller.editFQ); 
Router.post('/createFQ',[
    body('question')
    .not()
    .isEmpty(),
    body('answer')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.createFQ); 

Router.post('/deleteFQ',[
    body('FQID')
    .not()
    .isEmpty()
  
                    
],verfiyToken,controller.deleteFQ); 
Router.post('/AnswerSupport',verfiyToken,controller.AnswerSupport); 
Router.get('/getSupportMessagesFromUsers',verfiyToken,controller.getSupportMessagesFromUsers); 
 Router.get('/getFQ/:id',verfiyToken,controller.getFQ); 
 Router.get('/getFQ',verfiyToken,controller.getFQ); 
Router.get('/getBookingOpertaions/:status',verfiyToken,controller.getBookingOpertaions); 
Router.get('/getBookingOpertaions',verfiyToken,controller.getBookingOpertaions); 
Router.get('/getOrders/:orderId',verfiyToken,controller.getOrders); 
Router.get('/getOrders',verfiyToken,controller.getOrders); 
Router.get('/getAllPromo',verfiyToken,controller.getAllPromo); 
Router.get('/getAllUsers/:status',verfiyToken,controller.getAllUsers); 
Router.get('/getAllUsers/',verfiyToken,controller.getAllUsers); 
Router.get('/getTotalNumOfUsers/:status',verfiyToken,controller.getTotalNumOfUsers);
Router.get('/getTotalNumOfUsers/',verfiyToken,controller.getTotalNumOfUsers); 
Router.get('/getuserProfile/:UserId',verfiyToken,controller.getuserProfile);
Router.get('/getRequestById/:RequestId',verfiyToken,trederController.getRequestbyId);
Router.get('/getAllProducts/',verfiyToken,controller.getAllProducts);
Router.get('/TotalNum/:status',verfiyToken,controller.TotalNum);
Router.get('/getItemsByCatigory/',verfiyToken,controller.getItemsByCatigory);
Router.post('/sendNotifcationToMobile/',verfiyToken,controller.sendNotifcationToMobile);
Router.post('/createPolicy/',verfiyToken,controller.createPolicy);
Router.post('/editPolicy/',verfiyToken,controller.editPolicy);

Router.get('/getAdRequest/',verfiyToken,controller.getAdRequest);
Router.post('/AcceptAdRequest/',verfiyToken,controller.AcceptAdRequest);
Router.post('/SetDeleverToTrue/',verfiyToken,controller.SetDeleverToTrue);

Router.post('/createService',uploadImage.array('image'),[
    
    
    body('name')
    .not()
    .isEmpty(),
    body('arb_name')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.createService); 

Router.post('/EditService',uploadImage.array('image'),[
    
    
    body('name')
    .not()
    .isEmpty(),
    body('arb_name')
    .not()
    .isEmpty(),
    body('ServiceId')
    .not()
    .isEmpty()
                    
],verfiyToken,controller.EditService); 

Router.post('/AddCity',[
    
    
    body('name')
    .not()
    .isEmpty(),
    body('arb_name')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.AddCity); 

Router.post('/deleteCity',[
    
    
    body('cityId')
    .not()
    .isEmpty(),
  
                    
],verfiyToken,controller.deleteCity); 

Router.get('/suggests/:id',verfiyToken,controller.suggest)
Router.get('/suggests',verfiyToken,controller.suggest)

Router.get('/getAllWithDarwRequests',verfiyToken,controller.getAllWithDarwRequests)
Router.post('/ChangWithDrawStatus',verfiyToken,controller.ChangWithDrawStatus)
Router.post('/deleteAppartmetbyID',verfiyToken,controller.deleteADById)
Router.post('/refuseADbyID',verfiyToken,controller.refuseADbyID)

Router.get('/getShopIncome',verfiyToken,controller.getShopIncome)


//llsl

module.exports=Router
