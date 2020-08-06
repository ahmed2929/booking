const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const ADS = require('../../models/ADS');
const Catigory=require('../../models/Catigory');
const { json } = require('body-parser');
const { countDocuments } = require('../../models/ADS');
const fs = require('fs');
const path=require('path')
const AvilableServices=require('../../models/AvilableServices');
const { start } = require('repl');



var getAvilableCatigories=async (req,res,next)=>{

    try{
    const catigories=await Catigory.find({})
    console.debug(catigories)
    const resCatigory=catigories.map(cat=>{
        return {id:cat._id,name:cat.name}
    })
    res.status(200).json({state:1,resCatigory});
}catch(err){
    console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
}


}

var getAvilableServices=async (req,res,next)=>{
try{
    const Services=await AvilableServices.find({})
    console.debug(Services)
    const resServices=Services.map(ser=>{
        return {id:ser._id,name:ser.name}
    })
    res.status(200).json({state:1,resServices});
}catch(err){

    console.debug(err)
    if(!err.statusCode){
        err.statusCode = 500; 
    }
    return next(err);

}


}

const getADSWithCatigrories=async(req,res,next)=>{

    const itemsPerPage=10;
    const CatigoriesWithADs=await Catigory.find({})
    .populate('ads')
    .populate({ path: 'ads', populate: { path: 'services.serviceType'}})
    
    
      const CatigorieADobj=CatigoriesWithADs.map(item=>{
        var result=[]
        var ADsInfo={};
        if(item.ads.length>0){
           var index=0
            for(let i=0;i<item.ads.length;i++) {
                if(index==itemsPerPage){
                    index=0;
                    break;
                }
                var element=item.ads[i]
                ADsInfo={
                    id:element._id,
                    title:element.title,
                    country:element.country,
                    city:element.city,
                    streetAdress:element.streetAdress,
                    price:element.price,
                    rate:element.rate,
                    services:element.services
             }
             result.push(ADsInfo)
            index++;

                
            }
            
        

           }
                
           
            return {result,catgoryName:item.name,catgoryId:item._id}
        
         
      })
    
    console.debug(CatigorieADobj)

      res.status(200).json({state:1,CatigorieADobj})

}

const getAdDetailsById=async(req,res,next)=>{

    try{
        const AdId=req.params.AdId
        const AD= await ADS.findById(AdId)
        .select('-catigory')
        .select('-createdAt')
        .select('-updatedAt')
        .select('-Creator')
        .populate('services.serviceType')
        
        
        
        res.status(200).json({state:1,AD})


    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
  





}

const getAvilabecites=(req,res,next)=>{
    res.status(200).json({state:1,cities:["Abu Dhabi","Ajman","Dubai","Fujairah","Ras Al Khaimah","Sharjah","Umm Al Quwain"]})
}

const getCatigoriesAdById=async (req,res,next)=>{

    try{
        const page = req.query.page *1 || 1;
        
        const itemPerPage = 10;
        console.debug(req.params)
        const catigoryId=req.params.catigoryId;
        var totalAds=await ADS.find({catigory:catigoryId}).countDocuments()
        const Ads=await ADS.find({catigory:catigoryId})
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .populate('services.serviceType')
        res.status(200).json({totalNumOfAds:totalAds,hasNextPage:itemPerPage*page<totalAds,hasPerivousPage:page>1,nextPage:page+1,previousPage:page-1,result:Ads})
    }catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }




}

const getAdsFilter=async (req,res,next)=>{
    try{
    const {city,rooms,type,priceFrom,priceTo,review,beds,beach}=req.body //review,beds,beach,
    console.debug('controller run')
    const AD=await ADS.find({
        price:{ $gte :  priceFrom,$lte:priceTo},
        city:city,
        star:{$gte :review},
        NumOfRooms:rooms,
        beds:beds,
        beach:beach

    })
    .populate({
        path: 'catigory',
        select: 'name',
    })
  
    var finalRes=AD.filter(obj=>{
        return obj.catigory.name===type
    })
   res.status(200).json({state:1,finalRes})
}
   catch(err){
    console.debug(err)
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);

}
}

module.exports={
getAvilableCatigories,
getAvilableServices,
getADSWithCatigrories,
getAvilabecites,
getAdDetailsById,
getCatigoriesAdById,
getAdsFilter

}