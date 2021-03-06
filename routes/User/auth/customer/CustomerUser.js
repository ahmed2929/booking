const express=require('express');
const Router=express.Router();
const controller=require('../../../../controllers/auth/customer/local_CustomerUser')
const {body} =require('express-validator')  
const CustumerUser=require('../../../../models/CustomerUser');
const { json } = require('body-parser');
const verfiyToken=require('../../../../helpers/Auth/CustomerAuth')

Router.put('/register',
[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail(),
    body('password','enter a password with only number and text and at least 5 characters.')
    .isLength({min:5})
    .trim()
    ,
    body('comfirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value!=req.body.password){
            return Promise.reject('password has to match');
        }
        return true ;
    }),
    body('name').not().isEmpty().trim()
    .isLength({ min: 4 ,max:25})
    ,
    body('mobile')
    .not().isEmpty()
    .custom((value,{req,res,next})=>{
        return CustumerUser.findOne({mobile:value})
        .then(result=>{
            if(result){
                return Promise.reject('phone allready exists!');
            }
        }).catch(err=>{
            throw err
        })
    })
]
,controller.register);


Router.post('/login',[
body('email')
.not()
.isEmpty(),
body('password')
.not()
.isEmpty(),
body('FCM')
.not()
.isEmpty()

],controller.login);

Router.post('/forgetPassword',[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail()
    .custom((value,{req})=>{
        return CustumerUser.findOne({email:value})
        .then(result=>{
            if(!result){
                return Promise.reject('E-mail not found');
            }
        })
    })
],controller.ForgetPassword);

Router.post('/VerfyCode',[
    body('code')
    .not()
    .isEmpty()
],controller.VerfyCode)

Router.put('/PasswordRest',[
    body('password','enter a password with only number and text and at least 5 characters.')
    .isLength({min:5})
    .trim(),
    body('comfirmPassword')
    .custom((value,{req})=>{
        if(value!=req.body.password){
            return Promise.reject('password has to match');
        }
        return true ;
    }).trim()
],verfiyToken,controller.PasswordRest)

Router.post('/logout',[
    body('FCM')
    .not()
    .isEmpty()
],verfiyToken,controller.Logout)

Router.post('/SendactivateEmail',verfiyToken,controller.SendactivateEmail)

Router.post('/VerfyActiveEmailCode',[
    body('code')
    .not()
    .isEmpty()
],verfiyToken,controller.VerfyActiveEmailCode)


Router.put('/singInWithGoogle',
[
    body('id')
    .not()
    .isEmpty(),
    body('email')
    .not()
    .isEmpty(),
    body('fullName')
    .not()
    .isEmpty(),
    body('photo')
    .not()
    .isEmpty(),
    body('FCM')
    .not()
    .isEmpty()
    
]
,controller.googleWithOuthData);

Router.put('/singInWithFacebook',
[
    body('id')
    .not()
    .isEmpty(),
    body('email')
    .not()
    .isEmpty(),
    body('fullName')
    .not()
    .isEmpty(),
    body('photo')
    .not()
    .isEmpty(),
    body('FCM')
    .not()
    .isEmpty()
]
,controller.facebookWithOuthData);






module.exports=Router
