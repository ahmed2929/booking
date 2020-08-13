const express = require('express');
//const router = require('express-promise-router')();
const Router=express.Router();
const passportConf = require('../../../../helpers/Auth/socialMedia/trader/passport');
const passport = require('passport')
const jwt = require('jsonwebtoken');



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
   



module.exports = Router;