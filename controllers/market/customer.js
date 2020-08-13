const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const ADS = require('../../models/ADS');
const Catigory=require('../../models/catigory.js');
const { json } = require('body-parser')
const { countDocuments } = require('../../models/ADS');
const fs = require('fs');
const path=require('path')
const CustomerUser=require('../../models/customerUser')
const trederUser=require('../../models/TrederUsers')
const Product=require('../../models/shopProducts')
const AvilableServices=require('../../models/AvilableServices')
const Request=require('../../models/Request');
const { use } = require('passport');
const paginate=require('../../helpers/general/helpingFunc').paginate

const Book=async (req,res,next)=>{
    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

       var {AdId,StartDate,EndDate,Adult,children,services,finalPrice,ArivalTime,gender}=req.body
            StartDate =new Date(StartDate)
            EndDate =new Date(EndDate)
        
       if(StartDate.toString() ==='Invalid Date'||EndDate.toString()==='Invalid Date'){
        
        const error = new Error('invalid date');
            error.statusCode = 422 ;
            return next(error) ; 

       }

       if(StartDate<= Date.now()){
        const error = new Error('start date cannot be in the past');
        error.statusCode = 422 ;
        return next(error) ; 

       }
       
       if(StartDate>=EndDate){

        const error = new Error('end date cannot be equal or less than start date');
            error.statusCode = 422 ;
            return next(error) ; 


       }



       const ad=await ADS.findById(AdId)
       if(!ad){

        const error = new Error('ad not found');
            error.statusCode = 404 ;
            return next( error) ;

       }
       console.debug('start date',StartDate)
       console.debug('end date',EndDate)
       var newRequest= new Request({
           from:req.userId,
           to:ad.Creator,
           AD:AdId,
           RequestData:{
            StartDate:StartDate,
            EndDate:EndDate,
            Adult:Adult,
            children:children,
            services:services,
            finalPrice,
            ArivalTime,
            gender
           }
           
       })
       await newRequest.save()
       var editCustomer=await CustomerUser.findById(req.userId)
       editCustomer.pendingRequestTo.push(newRequest._id)
       await editCustomer.save()
       var editTreder=await trederUser.findById(ad.Creator)
       editTreder.RecivedRequest.push(newRequest._id)
       await editTreder.save()
       res.status(200).json({state:1,msg:'request sent'})



}catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}
}

const getMyRequests=async (req,res,next)=>{
try{
    const page = req.query.page *1 || 1;
    const itemPerPage = 10;
    const customer=await CustomerUser.findById(req.userId)
    .select('pendingRequestTo')
    .populate('pendingRequestTo')
    .populate({ path: 'pendingRequestTo', populate: { path: 'to'}})
    .populate({ path: 'pendingRequestTo', populate: { path: 'AD'}})
    var limitedResult=paginate(customer.pendingRequestTo,itemPerPage,page)
    
    var mapedLimitedResult=limitedResult.map(oldObj=>{ 
        var FResult={}
        if(!oldObj.AD){
            
            return 
        }
    var StartDate=oldObj.RequestData.StartDate
    var EndDate=oldObj.RequestData.EndDate
    var renterPhone=oldObj.to.mobile
    var renterName=oldObj.to.name
    var title=oldObj.AD.title
    var city=oldObj.AD.city 
    var streetAdress= oldObj.AD.streetAdress
    var RequestId=oldObj._id
    var status=oldObj.RequestData.status
    var InFuture=StartDate >Date.now() ?true:false
    var InPast=EndDate <Date.now() ?true:false
    var canRate=StartDate<Date.now()
    var arivalTime=oldObj.RequestData.ArivalTime
    var message=oldObj.refuseMassage
    var adId=oldObj.AD._id

     FResult={
        StartDate,
        EndDate,
        renterPhone,
        renterName,
        title,
        RequestId,
        status,
        InFuture,
        InPast,
        arivalTime,
        message,
        adId,
        city,
        streetAdress,
        canRate
        

    }

        return FResult



     })

     mapedLimitedResult = mapedLimitedResult.filter(function (el) {
        return el != null;
      });
      
    res.status(200).json({state:1,Result:mapedLimitedResult})
    //if(Date.now()<cus)




       
}catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}





}
const reschedule=async (req,res,next)=>{

    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

       var {RequestId,StartDate,EndDate,Adult,children,services,FinalservicePrice,finalPrice,ArivalTime}=req.body
            StartDate =new Date(StartDate)
            EndDate =new Date(EndDate)
        
       if(StartDate.toString() ==='Invalid Date'||EndDate.toString()==='Invalid Date'){
        
        const error = new Error('invalid date');
            error.statusCode = 422 ;
            return next(error) ; 

       }

       if(StartDate<= Date.now()){
        const error = new Error('start date cannot be in the past');
        error.statusCode = 422 ;
        return next(error) ; 

       }
       
       if(StartDate>=EndDate){

        const error = new Error('end date cannot be equal or less than start date');
            error.statusCode = 422 ;
            return next(error) ; 


       }



       var request=await Request.findById(RequestId)
       if(!request){

        const error = new Error('request not found');
            error.statusCode = 404 ;
            return next( error) ;

       }
       //console.debug('start date',StartDate)
       //console.debug('end date',EndDate)
       
       request.RequestData={
            StartDate:StartDate,
            EndDate:EndDate,
            Adult:Adult,
            children:children,
            services:services,
            FinalservicePrice,
            finalPrice,
            ArivalTime,
            status:2
           }

       
       console.debug("requested data",request.RequestData)
       await request.save()
      
       res.status(200).json({state:1,msg:'request edited'})



}catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}



}

const Rate=async(req,res,next)=>{
    try{
        
    const {star,RequestId}=req.body
    var request=await Request.findById(RequestId)
    if(!request){

     const error = new Error('request not found');
         error.statusCode = 404 ;
         return next( error) ;

    }

    if(request.from.toString()!=req.userId){
        const error = new Error('usr id doesnt match request sender id');
        error.statusCode = 404 ;
        return next( error) ;

    }
    console.debug(request.RequestData.status)
    if(request.RequestData.status!=1){
        const error = new Error('you cant rate this ad');
        error.statusCode = 404 ;
        return next( error) ;

    }
    if(request.StartDate>Date.now()){
        const error = new Error('you cant rate this ad wait when your vication start');
        error.statusCode = 404 ;
        return next( error) ;

    }
    if(request.RateState.status==1){
        const error = new Error('you cant rate agin you already rated this ad');
        error.statusCode = 404 ;
        return next( error) ;

    }

    const rateAd=await ADS.findById(request.AD)
    rateAd.Rate.addToSet({user:req.userId,userRate:star})
    var sumOfRates=0
    rateAd.Rate.forEach(element => {
        sumOfRates+=element.userRate
    })
    rateAd.star=sumOfRates/rateAd.Rate.length
    console.debug(rateAd.star)
    await rateAd.save()
    request.RateState.status=1
    request.RateState.star=star
    await request.save()
    res.status(200).json({state:1,msg:'you rated is success'})
    }catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}
}

const putItemToCart=async(req,res,next)=>{
    try{
        
        const {ProductId}=req.body
        const product=await Product.findById(ProductId)
        if(!product){
            const error = new Error('product not found');
            error.statusCode = 422 ;
            return next(error) ; 
    
        }
        const user=await CustomerUser.findById(req.userId)
        if(!user){

            const error = new Error('user not found');
            error.statusCode = 422 ;
            return next(error) ; 


        }
        if(product.avilableNumber<=0){
            const error = new Error('sorry product out of stock');
            error.statusCode = 422 ;
            return next(error) ; 
        }

        const productIndex=user.cart.product.indexOf(ProductId.toString())

        if(productIndex>-1){
            user.cart.push({
                product:ProductId,
                numberNeeded:user.cart[productIndex].numberNeeded +1
            })
        }else{

            user.cart.push({
                product:ProductId,
            })

        }
        await user.save()

         res.status(200).json({state:1,msg:'the item added to the cart'})
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
    }
}

const getCartItems=async(req,res,next)=>{
    try{
        
            const usercart=await CustomerUser.findById(req.userId)
            .populate('cart.product')
            .select('cart')

        

         res.status(200).json({state:1,Cart:usercart})
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
    }
}

module.exports={

    Book,
    getMyRequests,
    reschedule ,
    Rate 

}