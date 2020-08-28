const express = require('express');
//const router = require('express-promise-router')();
const Router=express.Router();
const passportConf = require('../../../../helpers/Auth/socialMedia/customer/passport');
const passport = require('passport')
const jwt = require('jsonwebtoken');

//const express=require('express');
//const Router=express.Router();
//const controller=require('../../../../controllers/auth/customer/local_CustomerUser')
//const {body} =require('express-validator')  
//const CustumerUser=require('../../../../models/CustomerUser');
//const { json } = require('body-parser');
//const verfiyToken=require('../../../../helpers/Auth/CustomerAuth')
//const { validateBody, schemas } = require('../helpers/routeHelpers');
//const UsersController = require('../controllers/users');
//const passportSignIn = passport.authenticate('local', { session: false });
//const passportJWT = passport.authenticate('jwt', { session: false });

Router.post('/oauth/google',passport.authenticate('googleToken', { session: false }), (req,res,next)=>{
    try{
        const token  = jwt.sign(
            {
                userId:req.user._id.toString()
            },
            process.env.JWT_PRIVATE_KEY
        );
        return res.status(200).json({state:1,token});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    

})
 

 Router.post('/oauth/facebook',passport.authenticate('facebookToken', { session: false }), (req,res,next)=>{
    try{
        const token  = jwt.sign(
            {
                userId:req.user._id.toString()
            },
            process.env.JWT_PRIVATE_KEY
        );
        return res.status(200).json({state:1,token});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    
 })
   



 

// router.route('/oauth/link/google')
//   .post(passportJWT, passport.authorize('googleToken', { session: false }), UsersController.linkGoogle)

// router.route('/oauth/unlink/google')
//   .post(passportJWT, UsersController.unlinkGoogle);

// router.route('/oauth/link/facebook')
//   .post(passportJWT, passport.authorize('facebookToken', { session: false }), UsersController.linkFacebook)

// router.route('/oauth/unlink/facebook')
//   .post(passportJWT, UsersController.unlinkFacebook);

// router.route('/dashboard')
//   .get(passportJWT, UsersController.dashboard);

// router.route('/status')
//   .get(passportJWT, UsersController.checkAuth);

module.exports = Router;