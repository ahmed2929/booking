const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const ADS = require('../../models/ADS');
const Catigory=require('../../models/catigory');
const { json } = require('body-parser');
const { countDocuments, exists } = require('../../models/ADS');
const fs = require('fs');
const path=require('path')
const AvilableServices=require('../../models/AvilableServices');
const { start } = require('repl');
const mostView=require('../../models/topView');
const { all } = require('../../routes/admin/admin');
const { any } = require('../../helpers/uploadImage');
const shopcatigory =require('../../models/shopcatigory')
const City=require('./../../models/cities');
const treder = require('./treder');
var getAvilableCatigories=async (req,res,next)=>{

    try{
        const catId=req.params.catigoryId
        if(catId){

            const catigories=await Catigory.findById(catId)
        //console.debug(catigories)
        if(!catigories){
           return res.status(404).json({state:1,msg:'catigoryNotFound'});
        }
     return res.status(200).json({state:1,catigoryNae:catigories.name,arb_name:catigories.arb_name,id:catigories._id});


        }


    const catigories=await Catigory.find({})
    console.debug(catigories)
    const resCatigory=catigories.map(cat=>{
        return {id:cat._id,name:cat.name,arb_name:cat.arb_name}
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
    const serId=req.params.serviceId
    if(serId){
        
    const Service=await AvilableServices.findById(serId)
    if(!Service){
        return res.status(404).json({state:0,mgs:"service not found"});

    }
    return res.status(200).json({state:1,Service});


    }



    const Services=await AvilableServices.find({})
    console.debug(Services)
    const resServices=Services.map(ser=>{
        return {id:ser._id,name:ser.name,iconUrl:ser.image,arb_name:ser.arb_name}
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
        const AdId=req.params.AdId||req.query.id
        const AD= await ADS.findById(AdId)
        .populate({path:'Creator' ,select:'name email mobile'})
        .select('-catigory')
        .select('-createdAt')
        .select('-updatedAt')
        .populate('services.serviceType')
        
        
        
        res.status(200).json({state:1,AD})


    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
  





}

const getAvilabecites=async (req,res,next)=>{
    const cities=await City.find()
    .select('name arb_name')
    //["Abu Dhabi","Ajman","Dubai","Fujairah","Ras Al Khaimah","Sharjah","Umm Al Quwain"],arb_cities:["دبي","أبوظبي","الشارقة","العين","رأس الخيمة","عجمان"]
    res.status(200).json({state:1,cities})
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
        res.status(200).json({TotaNum:totalAds,hasNextPage:itemPerPage*page<totalAds,hasPerivousPage:page>1,nextPage:page+1,previousPage:page-1,result:Ads})
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
        const page = req.query.page *1 || 1;
        const itemPerPage = 10;
    var {city,rooms,type,priceFrom,priceTo,review,beds,beach,userId}=req.query
     //review,beds,beach,
     console.debug(req.query)
        var AD
        var TotalNumOfAds
        if(!beach){
            beach=undefined
        }
      

        var  CitiesData

       if(city){

        CitiesData =await City.findOne({
            $or:[{name:new RegExp( city , 'i')},{arb_name:new RegExp( city , 'i')}]

        })

       }
       var catigoryData={}
       if(type){

        catigoryData =await Catigory.findOne({

            $or:[{name:new RegExp( type , 'i')},{arb_name:new RegExp( type , 'i')}]


        })

       }

          

      
       

    if(beach===undefined){


//console.debug('firstttt',CitiesData.arb_name)

// handle city with tow
if(city){
    console.debug(catigoryData)
    console.debug(CitiesData)
    TotalNumOfAds=await ADS.find({
        price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
        city:{"$in":[CitiesData.name,CitiesData.arb_name]},
        star:{$gte :review||-1},
        NumOfRooms:rooms||{ $exists:true},
        beds:beds||{ $exists:true},
        catigory:catigoryData._id||{ $exists:true},
        Creator:userId.toString()|| { $exists:true} 
        
    }).countDocuments()



     AD=await ADS.find({
        price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
        city:{"$in":[CitiesData.name,CitiesData.arb_name]} ||{ $exists:true},
        star:{$gte :review||-1},
        NumOfRooms:rooms||{ $exists:true},
        beds:beds||{ $exists:true},
        catigory:catigoryData._id||{ $exists:true},
        Creator:userId.toString()|| { $exists:true} 
    })
    .populate({
        path: 'catigory',
        select: 'name',
    })
    .populate({
        path: 'services.serviceType',
       // select: 'name',
    }).select('images title city streetAdress price services')
    .skip((page - 1) * itemPerPage)
.limit(itemPerPage)
}else{
    TotalNumOfAds=await ADS.find({
        price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
        star:{$gte :review||-1},
        NumOfRooms:rooms||{ $exists:true},
        beds:beds||{ $exists:true},
        catigory:catigoryData._id||{ $exists:true},
        Creator:userId.toString()|| { $exists:true} 
    }).countDocuments()



     AD=await ADS.find({
        price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
        star:{$gte :review||-1},
        NumOfRooms:rooms||{ $exists:true},
        beds:beds||{ $exists:true},
        catigory:catigoryData._id||{ $exists:true},
        Creator:userId.toString()|| { $exists:true} 
    })
    .populate({
        path: 'catigory',
        select: 'name',
    })
    .populate({
        path: 'services.serviceType',
       // select: 'name',
    }).select('images title city streetAdress price services')
.skip((page - 1) * itemPerPage)
.limit(itemPerPage)
console.debug(AD.length)
}



///////////////   
    }else{


        if(city){
            console.debug(catigoryData)
            TotalNumOfAds=await ADS.find({
                price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
                city:{"$in":[CitiesData.name,CitiesData.arb_name]},
                star:{$gte :review||-1},
                NumOfRooms:rooms||{ $exists:true},
                beds:beds||{ $exists:true},
                catigory:catigoryData._id||{ $exists:true},
                beach:beach,
                Creator:userId.toString()|| { $exists:true} 
            }).countDocuments()
        
        
        
             AD=await ADS.find({
                price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
                city:{"$in":[CitiesData.name,CitiesData.arb_name]} ||{ $exists:true},
                star:{$gte :review||-1},
                NumOfRooms:rooms||{ $exists:true},
                beds:beds||{ $exists:true},
                catigory:catigoryData._id||{ $exists:true},
                beach:beach,
                Creator:userId.toString()|| { $exists:true} 
            })
            .populate({
                path: 'catigory',
                select: 'name',
            })
            .populate({
                path: 'services.serviceType',
               // select: 'name',
            }).select('images title city streetAdress price services')
            .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        }else{
            TotalNumOfAds=await ADS.find({
                price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
                star:{$gte :review||-1},
                NumOfRooms:rooms||{ $exists:true},
                beds:beds||{ $exists:true},
                beach:beach,
                catigory:catigoryData._id||{ $exists:true},
                Creator:userId.toString()|| { $exists:true} 
            }).countDocuments()
        
        
        
             AD=await ADS.find({
                price:{ $gte :priceFrom||0,$lte:priceTo||2147483647},
                star:{$gte :review||-1},
                NumOfRooms:rooms||{ $exists:true},
                beds:beds||{ $exists:true},
                catigory:catigoryData._id||{ $exists:true},
                beach:beach,
                Creator:userId.toString()|| { $exists:true} 

            })
            .populate({
                path: 'catigory',
                select: 'name',
            })
            .populate({
                path: 'services.serviceType',
               // select: 'name',
            }).select('images title city streetAdress price services')
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        console.debug(AD.length)
        }







    }

   
    var finalRes=AD
//   if(type){
//     var finalRes=AD.filter(obj=>{
//         return obj.catigory.name===type
//     })
//   }
    
   res.status(200).json({state:1,finalRes,TotaNum:TotalNumOfAds})
}
   catch(err){
    console.debug(err)
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);

}
}


const getMostView=async (req,res,next)=>{
    const page = req.query.page *1 || 1;
    const itemPerPage = 10; 
    
    try{

        const  totalAds = await mostView.find({}).countDocuments();   
    const mostview=await mostView.find()
    .populate({path:'ad' ,select:'title price images city streetAdress _id '})
    .select('-_id -position')
    .sort('position')
    .skip((page - 1) * itemPerPage)
    .limit(itemPerPage)
   res.status(200).json({state:1,TotaNum:totalAds,mostview})
}
   catch(err){
    console.debug(err)
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);

}
}

const getAllads=async (req,res,next)=>{
    const page = req.query.page *1 || 1;
    const itemPerPage = 10; 
    try{
      const  totalAds = await ADS.find({}).countDocuments();   
    const allAds=await ADS.find()
    .sort({'star':-1})
    .populate({path:'services.serviceType',select:'name image -_id ' , populate: { path: 'Creator',select:'name mobile email'}})
    //.populate({ path: 'ads', populate: { path: 'services.serviceType'}})
    .select('images title city streetAdress price services ')
    .skip((page - 1) * itemPerPage)
    .limit(itemPerPage)
    
   res.status(200).json({state:1,TotaNum:totalAds,allAds})
}
   catch(err){
    console.debug(err)
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);

}
}
const getShopAvilablCatigory=async(req,res,next)=>{
    
    try{
          const cato=await shopcatigory.find()
          .select('name arb_name')
          
       
            res.status(200).json({state:1,catigories:cato})
    
        }catch(err){
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
getAdsFilter,
getMostView,
getAllads,
getShopAvilablCatigory

}