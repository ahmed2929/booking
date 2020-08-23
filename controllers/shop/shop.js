const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const admin = require('../../models/admin');
const Catigory=require('../../models/shopcatigory');
const Product=require('../../models/shopProducts')
const Promo=require('../../models/promocode')
const { connected } = require('process');
const path=require('path')
//const validatePhoneNumber = require('validate-phone-number-node-js');
//const nodemailerMailgun=require('../../../helpers/sendEmail');
const fs=require('fs');
const shopcatigory = require('../../models/shopcatigory');
     

var getAllProducts=async(req,res,next)=>{
    
    try{
    
          const products=await Product.find({avilableNumber:{$gt:0}})
          .select('images _id title price desc avilableNumber')
       
            res.status(200).json({state:1,products})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        

}

var getProductsByCatigory=async(req,res,next)=>{
    
    try{
        const catigoryID=req.params.id
    
        //   const products=await Product.find({
        //       Catigory:catigoryID
        //   })
          const cato=await shopcatigory.findById(catigoryID)
          .populate({path:'products' , select:'images _id title price desc avilableNumber'})
          .select('products')
          
       
            res.status(200).json({state:1,products:cato.products})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        

}
var getProductByID=async(req,res,next)=>{
    
    try{
        const productId=req.params.id
    
          const product=await Product.findById(productId)
          .select('images _id title price desc avilableNumber')
          
       
            res.status(200).json({state:1,product})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        

}

const checkPromo=async(req,res,next)=>{
    try {
      const PromoName=req.body.Promo||null
      const promo=await Promo.findOne({name:PromoName})
      .select('descPercent')
      if(!promo){
        return res.status(404).json({state:0,msg:'invalid promo code'})
      }
      return res.status(200).json({state:1,promo})
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  }
  

module.exports={
 
    getAllProducts,
    getProductsByCatigory,
    getProductByID,
    checkPromo,
    


}