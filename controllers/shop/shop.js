const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const admin = require('../../models/admin');
const Catigory=require('../../models/shopcatigory');
const Product=require('../../models/shopProducts')
const { connected } = require('process');
const path=require('path')
//const validatePhoneNumber = require('validate-phone-number-node-js');
//const nodemailerMailgun=require('../../../helpers/sendEmail');
const fs=require('fs')


        

var getAllProducts=async(req,res,next)=>{
    
    try{
    
          const products=await Product.find({})
       
            res.status(201).json({state:1,products})
    
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
    
          const products=await Product.find({
              Catigory:catigoryID
          })
          
       
            res.status(201).json({state:1,products})
    
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
          
       
            res.status(201).json({state:1,product})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        

}

module.exports={
 
    getAllProducts,
    getProductsByCatigory,
    getProductByID


}