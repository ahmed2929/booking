const express=require('express');
const Router=express.Router();
const {body} =require('express-validator')  
const { json } = require('body-parser');
const verfiyToken=require('../../../helpers/Auth/TrederAuth')
const uploadImage=require('../../../helpers/uploadImage');
const bodyParser = require('body-parser');
const conttroller=require('../../../controllers/market/treder')
const CheckActivation=require('../../../helpers/Auth/checkactivation')
const TrederUser=require('../../../models/TrederUsers')


Router.put('/createApartment',verfiyToken,uploadImage.array('image'),[
    body('city')
    .not()
    .isEmpty(),
    body('streetAdress')
    .not()
    .isEmpty(),
    body('catigory')
    .not()
    .isEmpty(),
    body('price')
    .not()
    .isEmpty(),
    body('title')
    .not()
    .isEmpty(),
    body('details')
    .not()
    .isEmpty(),


],CheckActivation,conttroller.CreateAppartment);


Router.put('/editApartment',verfiyToken,uploadImage.array('image'),
CheckActivation,conttroller.editAdById);





Router.delete('/deleteApartment',verfiyToken,uploadImage.array('image'),[
   
    body('ADId')
    .not()
    .isEmpty()
 
 ],CheckActivation,conttroller.deleteById); 
Router.get('/getMyADs',verfiyToken,conttroller.getMyADs)
Router.get('/getAllRequests',verfiyToken,conttroller.getAllRequests)
Router.get('/getRequestbyId/:RequestId',verfiyToken,conttroller.getRequestbyId)
Router.get('/getRequestbyId/',verfiyToken,conttroller.getRequestbyId)
Router.post('/acceptRequest',verfiyToken,CheckActivation,conttroller.acceptRequest)
Router.post('/DisAgreeRequest',verfiyToken,CheckActivation,conttroller.disAgree)

Router.get('/getMyProfile',verfiyToken,conttroller.getMyProfile)
Router.get('/getMyIncome',verfiyToken,conttroller.getMyIncome)

Router.put('/editMyProfile',verfiyToken,uploadImage.array('image'),[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail()
    .custom((value,{req,res,next})=>{
        const userId=req.userId
        console.debug('will search email')
        return TrederUser.findOne({
        email:value,
        _id:{$ne:userId.toString()}
    
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

],conttroller.editMyProfile);

Router.get('/getReviews',verfiyToken,conttroller.getLatestReviews)
Router.get('/getNotifications',verfiyToken,conttroller.getNotifications)


Router.put('/contactSupport',verfiyToken,conttroller.contactSupport)
Router.put('/MakeOrder',verfiyToken,CheckActivation,conttroller.MakeOrder)
Router.post('/putItemToCart',verfiyToken,conttroller.putItemToCart)
Router.get('/getCartItems',verfiyToken,conttroller.getCartItems)
Router.post('/decreseCartItem',verfiyToken,conttroller.decreseCartItem)
Router.post('/DeleteCartItem',verfiyToken,conttroller.DeleteCartItem)
Router.get('/getMyOreder',verfiyToken,conttroller.getMyOreder)
Router.post('/suggest',verfiyToken,conttroller.suggest)
Router.post('/MoneyWithDrawRequest',verfiyToken,[
   
    body('RequiredWithdrowMoney').not().isEmpty(),
    body('Address').not().isEmpty(),
    body('BankName').not().isEmpty(),
    body('AccountNumber').not().isEmpty(),
    body('BankCode').not().isEmpty(),
    body('MobileNumber').not().isEmpty(),
    body('Email').not().isEmpty(),

    





],conttroller.MoneyWithDrawRequest)

Router.get('/getMyWallet',verfiyToken,conttroller.getMyWallet)

Router.post('/CreatAddress',verfiyToken,conttroller.CreatAddress)
Router.get('/getMyAddress',verfiyToken,conttroller.getMyAddress)

module.exports=Router
