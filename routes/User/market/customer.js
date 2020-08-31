const express=require('express');
const Router=express.Router();
const {body,sanitize,check} =require('express-validator')  
const { json } = require('body-parser');
const verfiyToken=require('../../../helpers/Auth/CustomerAuth')
const uploadImage=require('../../../helpers/uploadImage');
const bodyParser = require('body-parser');
const conttroller=require('../../../controllers/market/customer')
const CheckActivation=require('../../../helpers/Auth/checkactivation');
const customer = require('../../../controllers/market/customer');
const CustomerUser=require('../../../models/CustomerUser')
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
    
  
  

],CheckActivation,conttroller.Book);

Router.get('/getMyRequests',verfiyToken,conttroller.getMyRequests)
//Router.get('/getMyRequests',verfiyToken,CheckActivation,conttroller.getMyRequests)
Router.put('/reschedule',verfiyToken,conttroller.reschedule)
Router.post('/Rate',verfiyToken,conttroller.Rate)
Router.post('/putItemToCart',verfiyToken,conttroller.putItemToCart)
Router.get('/getCartItems',verfiyToken,conttroller.getCartItems)
Router.post('/decreseCartItem',verfiyToken,conttroller.decreseCartItem)
Router.get('/getMyProfile',verfiyToken,conttroller.getMyProfile)
Router.put('/editMyProfile',uploadImage.array('image'),verfiyToken,[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail()
    .custom((value,{req,res,next})=>{
        const userId=req.userId
        console.debug('will search email')
        return CustomerUser.findOne({
        email:value,
        _id:{$ne:userId}
    
    })
        .then(result=>{
            console.debug(result)
            if(result){
                return Promise.reject('it is another customer email');
            }
        }).catch(err=>{
            
            
           throw err
        
        
        })
    }),
    
    body('name').not().isEmpty().trim()
    .isLength({ min: 4 ,max:25}),
   
],conttroller.editMyProfile)
Router.put('/MakeOrder',verfiyToken,CheckActivation,conttroller.MakeOrder)
Router.put('/contactSupport',verfiyToken,conttroller.contactSupport)
Router.get('/getNotifications',verfiyToken,conttroller.getNotifications)
Router.post('/DeleteCartItem',verfiyToken,conttroller.DeleteCartItem)
Router.get('/getMyOreder',verfiyToken,conttroller.getMyOreder)
Router.post('/PayForAppartment',verfiyToken,CheckActivation,conttroller.PayForAppartment)






module.exports=Router
