const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const ADS = require('../../models/ADS');
//const Catigory=require('../../models/Catigory');
//console.debug( Catigory)
const Catigory =require('../../models/catigory')
const { json } = require('body-parser');
const { countDocuments } = require('../../models/ADS');
const fs = require('fs');
const path=require('path')
const TrederUsers=require('../../models/TrederUsers')
const AvilableServices=require('../../models/AvilableServices')
const Request=require('../../models/Request')
const paginate=require('../../helpers/general/helpingFunc').paginate
var CreateAppartment=async (req,res,next)=>{
    console.debug('controller runas')
    try{
        if(req.body.services){
            req.body.services=JSON.parse( req.body.services)
        }else{
            req.body.services={}
        }
    


    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {country,city,streetAdress,catigory,price,services,NumOfRooms,details,title,beds,beach}=req.body;

    if(!Number(price)){
        const error = new Error('invalid price');
        error.statusCode = 404 ;
        return next( error) ;
    }


    const imageUrl = req.files;
    const catigo = await Catigory.findById(catigory);
    if(!catigo){
        const error = new Error('User not Found');
        error.statusCode = 404 ;
        return next( error) ;
    }
    let images = [];

    if(imageUrl.length===0){
        const error = new Error('u should provide image');
        error.statusCode = 422 ;
        return next(error) ;
    }

    imageUrl.forEach(image=>{
            images.push(image.path);
        
    });
    
        const NewAd= new ADS({
            Creator:req.userId,
            country,
            city,
            streetAdress,
            catigory,
            price,
            services,
            images:images,
            NumOfRooms,
            details,
            title,
            beds,
            beach
    
        })
        await NewAd.save();
        

        const user =await TrederUsers.findById(req.userId)
        console.debug(user)
        user.MyWonAds.push(NewAd._id)
         await user.save()

            catigo.ads.push(NewAd._id)
            await catigo.save()
            res.status(200).json({state:1,message:'apparment created Sucessfully'});
        
        

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    


    }

var editAdById= async (req,res,next)=>{
    try{
        const AdId=req.body.ADId
       // console.debug(AdId)
        const AD=await ADS.findById(AdId)
        if(!AD){
        const error = new Error('No AD found !!');
        error.statusCode = 404 ;
        return next( error) ;

        }
        //console.debug('creator',AD.Creator,'user',req.userId)
        //console.debug(AD.Creator.toString() !=req.userId.toString())
        if(AD.Creator.toString() !=req.userId.toString()){
        const error = new Error('unautharized request');
        error.statusCode = 403 ;
        return next( error) ;
        }



        if(req.body.services){
            req.body.services=JSON.parse( req.body.services)
        }else{
            req.body.services={}
        }
    


    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {country,city,streetAdress,catigory,price,services,NumOfRooms,details,title,beds,beach}=req.body;

    if(!Number(price)){
        const error = new Error('invalid price');
        error.statusCode = 404 ;
        return next( error) ;
    }


    const imageUrl = req.files;
    const catigo = await Catigory.findById(catigory);
    if(!catigo){
        const error = new Error('catigory not found');
        error.statusCode = 404 ;
        return next( error) ;
    }
    let images = [];

    if(imageUrl.length!=0){
        AD.images=[]
        imageUrl.forEach(image=>{
            images.push(image.path);
        
    });     
    
    }else{
        images=AD.images
    }

   
    
            
            AD.country=country,
            AD.city=city
            AD.streetAdress=streetAdress
            AD.catigory=catigory
            AD.price=price
            AD.services=services
            AD.images=images
            AD.NumOfRooms=NumOfRooms
            AD.details=details
            AD.title=title
            AD.beds=beds
            AD.beach=beach
    
        
        await AD.save();
            res.status(200).json({state:1,message:'apparment uptated Sucessfully'});
        
        



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }


}

var deleteById=async (req,res,next)=>{
    try{
        const errors = validationResult(req);
            console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }

        const AdId=req.body.ADId
        const AD=await ADS.findById(AdId)
        if(!AD){
        const error = new Error('No AD found !!');
        error.statusCode = 404 ;
        return next( error) ;

        }
    
        if(AD.Creator.toString() !=req.userId.toString()){
        const error = new Error('unautharized request');
        error.statusCode = 403 ;
        return next( error) ;
        }
        
       // console.debug(AD)

      const user=await TrederUsers.findById(req.userId)
     const userIndex=user.MyWonAds.indexOf(AdId.toString())
        if (userIndex > -1) {
            user.MyWonAds.splice(userIndex, 1);
          }
          console.debug(AD.catigory)
    const catigory=await Catigory.findById(AD.catigory)
    console.debug(catigory)
    const catigoryIndex=await catigory.ads.indexOf(AdId.toString())
    if (catigoryIndex > -1) {
        console.debug(catigoryIndex)
        catigory.ads.splice(catigoryIndex, 1);
      }
      console.debug( 'catigory array',catigory.ads)
      await catigory.save()
      await user.save()

     await ADS.findByIdAndDelete(AdId);


      AD.images.forEach((i) => {
         console.debug(i)
       fs.unlink(path.join(i),(err)=>{
        console.debug(err)
       });
  
  });


     res.status(200).json({state:1,message:'apparment deleted Sucessfully'});




    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }

}

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

var getMyADs=async (req,res,next)=>{
    try{
        const user=await TrederUsers.findById(req.userId)
        .lean()
        .select('MyWonAds')
        .populate('MyWonAds')
        .populate({ path: 'MyWonAds', populate: { path: 'catigory'}})
        .populate({ path: 'MyWonAds', populate: { path: 'services.serviceType'}})

        const fResult=user.MyWonAds.map(value=>{
            return{
                id:value._id,
                images:value.images,
                country:value.country,
                city:value.city,
                street:value.streetAdress,
                catigoryName:value.catigory.name,
                price:value.price,
                services:value.services,
                title:value.title

            
            }
        })
        
        
        
        
       

        res.status(200).json({state:1,fResult});
    }catch(err){
    
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        return next(err);
    
    }
    
    
    }

var getAllRequests=async(req,res,next)=>{

    try{
        const page = req.query.page *1 || 1;
        const itemPerPage = 20;
        const Treder=await TrederUsers.findById(req.userId)
        .select('RecivedRequest')
        .populate('RecivedRequest')
        .populate({ path: 'RecivedRequest', populate: { path: 'from'}})
        .populate({ path: 'RecivedRequest', populate: { path: 'AD'}})
    .populate({ path: 'RecivedRequest', populate: { path: 'RequestData.services.serviceType'}})
        console.debug(Treder.RecivedRequest[0].RequestData.services[0].serviceType)
        
        var limitedResult=paginate(Treder.RecivedRequest,itemPerPage,page)
        var totalNumOfRequests=Treder.RecivedRequest.length
        var mapedLimitedResult=limitedResult.map(oldObj=>{ 
        var customerName=oldObj.from.name
        var image=oldObj.AD.images[0]
        var city=oldObj.AD.city
        var streetAdress=oldObj.AD.streetAdress
        var price=oldObj.AD.price
        var services=oldObj.RequestData.services    
        var status=  oldObj.RequestData.status 
        var arrivalTime=  oldObj.RequestData.ArivalTime 

        var FResult={
            customerName,
            image,
            city,
            streetAdress,
            price,
            services,
            RequestID:oldObj._id,
            status,
            arrivalTime
    
        }
    
            return FResult
    
    
    
         })
    
    
    
        res.status(200).json({state:1,totalNumOfRequests:totalNumOfRequests,hasNextPage:itemPerPage*page<totalNumOfRequests,hasPerivousPage:page>1,nextPage:page+1,previousPage:page-1,Result:mapedLimitedResult})
        //if(Date.now()<cus)
    
    
    
    
           
    }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
    }
    
    
    








}

var getRequestbyId=async(req,res,next)=>{

    try{
        const RequestId=req.params.RequestId

        const request=await Request.findById(RequestId)
        .populate('from')
        .populate({ path: 'RequestData', populate: { path: 'services.serviceType'}})
    
        if(!request){
            const error = new Error('request not found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
    
        var finalResult={
                RequestId,
             customerName:request.from.name,
             StartDate:request.RequestData.StartDate,
             EndDate:request.RequestData.EndDate,
             Adult:request.RequestData.Adult,
             children:request.RequestData.children,
             services:request.RequestData.services,
             FinalservicePrice:request.RequestData.FinalservicePrice,
             finalPrice:request.RequestData.finalPrice,
             status:request.RequestData.status,
             arrivalTime:request.RequestData.ArivalTime

        }



        res.status(200).json({state:1,finalResult})
    }catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}

   



}

var acceptRequest =async (req,res,next)=>{

    try{
        const {RequestId}=req.body

        const request=await Request.findById(RequestId)
    
        if(!request){
            const error = new Error('request not found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
    
        if(request.to.toString()!=req.userId.toString()){

            const error = new Error('not Authorized you are trying to accept request not belong to you!!');
            error.statusCode = 401 ;
            return next( error) ;

        }
        request.RequestData.status=1;
       await request.save();



        res.status(200).json({state:1,msg:'request accepted'})
    }catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}

   




}

var disAgree=async (req,res,next)=>{


    try{
        const {RequestId,message}=req.body

        const request=await Request.findById(RequestId)
    
        if(!request){
            const error = new Error('request not found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
    
        if(request.to.toString()!=req.userId.toString()){

            const error = new Error('not Authorized you are trying to take action to a request not belong to you!!');
            error.statusCode = 401 ;
            return next( error) ;

        }
        request.RequestData.status=-1;
        request.refuseMassage=message
       await request.save();



        res.status(200).json({state:1,msg:'request disagreed'})
    }catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}

   

}

module.exports={

CreateAppartment,
editAdById,
deleteById,
getAvilableCatigories,
getAvilableServices,
getMyADs,
getAllRequests,
getRequestbyId,
acceptRequest,
disAgree

}