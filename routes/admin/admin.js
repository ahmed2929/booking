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
    body('CatigoryName')
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
    body('CatigoryName')
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
Router.post('/createApprtmentCatigory',[
    
    body('name')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.createApprtmentCatigory); 

Router.post('/blockCustomerUser',[
    
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

Router.get('/getAllUsers/:status',verfiyToken,controller.getAllUsers); 
Router.get('/getAllUsers/',verfiyToken,controller.getAllUsers); 
Router.get('/getTotalNumOfUsers/:status',verfiyToken,controller.getTotalNumOfUsers);
Router.get('/getTotalNumOfUsers/',verfiyToken,controller.getTotalNumOfUsers); 
Router.get('/getuserProfile/:type/:UserId',verfiyToken,controller.getuserProfile);
Router.get('/getRequestById/:RequestId',verfiyToken,trederController.getRequestbyId);

Router.post('/createService',uploadImage.array('image'),[
    
    
    body('name')
    .not()
    .isEmpty(),
                    
],verfiyToken,controller.createService); 

//llsl

module.exports=Router
