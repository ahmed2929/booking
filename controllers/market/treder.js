const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {validationResult, Result} = require('express-validator');
const ADS = require('../../models/ADS');
//const Catigory=require('../../models/Catigory');
//console.debug( Catigory)
const Catigory =require('../../models/catigory')
const { json } = require('body-parser');
const { countDocuments } = require('../../models/ADS');
const fs = require('fs');
const path=require('path')
const TrederUsers=require('../../models/TrederUsers')
const Isuue =require('../../models/isuues')
const AvilableServices=require('../../models/AvilableServices')
const Request=require('../../models/Request');
const Product=require('../../models/shopProducts')
const paginate=require('../../helpers/general/helpingFunc').paginate
const Order=require('../../models/order')
const Payment=require('../../models/payment')
const TopView=require('../../models/topView')
const Suggest =require('../../models/suggest')
const Withdraw = require('../../models/withdraw');
const Wallet=require('../../models/wallet');
const getPaymentReport=require('../../controllers/general/payment').getPaymentReport

sendEmail=require('../../helpers/sendEmail').sendEmail
const notificationSend=require('../../helpers/send-notfication').send

var CreateAppartment=async (req,res,next)=>{
    console.debug('controller runas')
    try{
        console.debug('req.body.services',req.body.services)
        if(req.body.services){
            req.body.services=JSON.parse( req.body.services)
        }else{
            req.body.services={}
        }
    


    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        var message='validation faild'
        if(req.user.lang==1){
            message='بينات خاطئة'
        }
        const error = new Error(message);
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {country,city,streetAdress,catigory,price,services,NumOfRooms,details,title,beds,beach,N,E}=req.body;
    console.debug('reqBody',req.body)
    console.debug('reqimage : ',req.files)

    if(!Number(price)||Number(price)<=0){
        var message='invalid price'
        if(req.user.lang==1){
            message='سعر غير صحيح'
        }
        const error = new Error(message);
        error.statusCode = 404 ;
        return next( error) ;
    }


    const imageUrl = req.files;
    const catigo = await Catigory.findById(catigory);
    if(!catigo){
        const error = new Error('catigory not Found');
        error.statusCode = 404 ;
        return next( error) ;
    }
    let images = [];

    if(imageUrl.length===0){
        var message='you should provide image'
        if(req.user.lang==1){
            message='يجب ان ترفق صورة'
        }
        const error = new Error(message);
        error.statusCode = 422 ;
        return next(error) ;
    }

    imageUrl.forEach(image=>{
        
            images.push(image.filename);
        
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
            beach,
            GPS:{
                N:N,
                E:E
            }
    
        })
        await NewAd.save();
        

        const user =await TrederUsers.findById(req.userId)
        console.debug(user)
        user.MyWonAds.push(NewAd._id)
         await user.save()

            catigo.ads.push(NewAd._id)
            await catigo.save()
            
            var message='apparment created Sucessfully'
        if(req.user.lang==1){
            message='تم انشاء الاعلان بنجاح'
        }
            res.status(200).json({state:1,message:message});
        
        

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
    const {country,city,streetAdress,catigory,price,services,NumOfRooms,details,title,beds,beach,N,E}=req.body;
    console.debug(catigory)
    if(!Number(price)){
        var message='invalid price'
        if(req.user.lang==1){
            message='سعر غير صحيح'
        }
        const error = new Error(message);
        error.statusCode = 404 ;
        return next( error) ;
    }


    const imageUrl = req.files;
    const catigo = await Catigory.findById(catigory);
    console.debug(catigo)
    if(!catigo){
        const error = new Error('catigory not found');
        error.statusCode = 404 ;
        return next( error) ;
    }
    let images = [];

    if(imageUrl.length!=0){

        AD.images.forEach((i) => {
            console.debug(i)
          fs.unlink(path.join(i),(err)=>{
           console.debug(err)
          });

        AD.images=[]
        imageUrl.forEach(image=>{
            images.push(image.filename);
        })
            
    });   
    } else{
        images=AD.images
    }



    console.debug(AD.catigory.toString()!=catigory.toString())
    if(AD.catigory.toString()!=catigory.toString()){

        const cato=await Catigory.findById(AD.catigory)
        const catIndexinArray=cato.ads.indexOf(catigory.toString())
           if (catIndexinArray > -1) {
               cato.ads.splice(catIndexinArray, 1);
             }
           await cato.save()

           const catonew=await Catigory.findById(catigory)
           catonew.ads.push(AD._id)
              await catonew.save()

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
            AD.GPS.E=E
            AD.GPS.N=N
    
        
        await AD.save();
        var message='apparment created Sucessfully'
        if(req.user.lang==1){
            message='تم انشاء الاعلان بنجاح'
        }
            res.status(200).json({state:1,message:message});
        
        



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
        var message='validation faild'
        if(req.user.lang==1){
            message='بينات غير صحيحة'
        }
        const error = new Error(message);
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }

        const AdId=req.body.ADId
            console.debug('req.body',req.body)
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
        const request =await Request.findOne({
           "RequestData.status":1,
            "RequestData.EndDate":{ $gt: Date.now() },
            AD:AdId.toString()
        })
        console.debug(request)
        if(request){
            var message='you alreay accepted request for this ad wait till your requests expire'
            if(req.user.lang==1){
                message='لقد قمت بالمواقة علي طلب لهذا الاعلان لا يمكنك ان تقوم بمسحه'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }

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
       await TopView.deleteOne({
          ad:AdId
       })

      var MailingList=await Request.find({
        AD:AdId,

      }).populate({path:'from',select:'email'})
      .select('from')
      MailingList=MailingList.map(obj=>{
          return obj.from.email
      })
     


     const deleted= await Request.deleteMany({
         AD:AdId
       })

      console.debug('deleted',deleted)
    
       AD.images.forEach((i) => {
          console.debug(i)
        fs.unlink(path.join(i),(err)=>{
        console.debug(err)
        });
  
   });
   var message='apparment deleted Sucessfully'
   if(req.user.lang==1){
       message='لقد تم مسح الاعلان'
   }

    await res.status(200).json({state:1,message:message});
     if(MailingList){
   await sendEmail(MailingList,'News',`
       your request to rent ${AD.title} has been removed because the owner removed
       the AD form the market try to see other appartments in the market
      
      `)
     }


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
        // const user=await TrederUsers.findById(req.userId)
        // .lean()
        // .select('MyWonAds')
        // .populate('MyWonAds')
        // .populate({ path: 'MyWonAds', populate: { path: 'catigory'}})
        // .populate({ path: 'MyWonAds', populate: { path: 'services.serviceType'}})

        // const fResult=user.MyWonAds.map(value=>{
        //     return{
        //         id:value._id,
        //         images:value.images,
        //         country:value.country,
        //         city:value.city,
        //         street:value.streetAdress,
        //         catigoryName:value.catigory.name,
        //         price:value.price,
        //         services:value.services,
        //         title:value.title,
        //         GPS:value.GPS,
              
                

            
        //     }
        // })
        const page = req.query.page *1 || 1;
         const itemPerPage = 10; 
        console.debug((page - 1) * itemPerPage)
        var AdsLen=await TrederUsers.findById(req.userId)
        AdsLen=AdsLen.MyWonAds.length
        const user=await TrederUsers.findById(req.userId)
            .populate([
            // here array is for our memory. 
            // because may need to populate multiple things
            {
                path: 'MyWonAds',
                select: 'images country city street price title GPS services NotAvilable',
                
                options: {
                    sort:{'createdAt': -1},
                    skip: (page - 1) * itemPerPage,
                    limit : itemPerPage,
                    lean: true
                },
                match:{
                    // filter result in case of multiple result in populate
                    // may not useful in this case
                },
                 populate: { path: 'services.serviceType'},
                 lean:true

            },

           

        ])
        .lean()
        .select('MyWonAds')
        res.status(200).json({state:1,fResult:user.MyWonAds,TotaNum:AdsLen});
    }catch(err){
    
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        return next(err);
    
    }
    
    
    }

var getAllRequests=async(req,res,next)=>{
    console.debug('controller')
    try{
        console.debug(req.userId)
        const page = req.query.page *1 || 1;
        const status=req.query.status
        const itemPerPage = 10;

        const TotaNum=await Request.find({
            to:req.userId,
             "RequestData.status": status|| {$exists:true},  
        }).countDocuments()


        const request=await Request.find({
            to:req.userId,
             "RequestData.status": status|| {$exists:true},  
        })
        .populate({ path: 'to',select:'name'})
        .populate({ path: 'from',select:'name'})
         .populate({path: 'AD', select:'images city streetAdress price'})
         .populate('RequestData.services.serviceType')
         .skip((page - 1) * itemPerPage)
         .limit(itemPerPage)

    //     const Treder=await TrederUsers.findById(req.userId)
    //     .select('RecivedRequest')
    //     .populate('RecivedRequest')
    //     .populate({ path: 'RecivedRequest', populate: { path: 'from'}})
    //     .populate({ path: 'RecivedRequest', populate: { path: 'AD'}})
    // .populate({ path: 'RecivedRequest', populate: { path: 'RequestData.services.serviceType'}})
    //     //console.debug(Treder.RecivedRequest[0].RequestData.services[0].serviceType)
    //     //console.debug(Treder.RecivedRequest)
         if(!request){
             res.status(404).json({state:1,msg:'no requests are recived',Result:[]})
         }
    //     var limitedResult=paginate(Treder.RecivedRequest,itemPerPage,page)
    //     var totalNumOfRequests=Treder.RecivedRequest.length
        var mapedLimitedResult=request.map(oldObj=>{ 
            var FResult={}
             if(!oldObj.AD){
                
                 return 
             }
    //        // console.debug(Treder.RecivedRequest[1])
             var customerName=oldObj.from.name
         var image=oldObj.AD.images[0]
         var city=oldObj.AD.city
         var streetAdress=oldObj.AD.streetAdress
         var price=oldObj.AD.price
         var services=oldObj.RequestData.services    
         var status=  oldObj.RequestData.status 
         var arrivalTime=  oldObj.RequestData.ArivalTime 
        var StartDate=oldObj.RequestData.StartDate
        var EndDate=oldObj.RequestData.EndDate
          var FResult={
             customerName,
             image,
            city,
            streetAdress,
             price,
             services,
             RequestID:oldObj._id,
             status,
             StartDate,
             EndDate,
             arrivalTime
        }
           
        
    
             return FResult
    
    
    
         })
    
          
    
    //totalNumOfRequests:totalNumOfRequests,hasNextPage:itemPerPage*page<totalNumOfRequests,hasPerivousPage:page>1,nextPage:page+1,previousPage:page-1
        res.status(200).json({state:1,Result:mapedLimitedResult,TotaNum})
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
        const RequestId=req.params.RequestId||req.query.id

        const request=await Request.findById(RequestId)
        .populate('from')
        .populate({ path: 'RequestData', populate: { path: 'services.serviceType'}})
    
        if(!request){
            const error = new Error('request not found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
            console.debug(request)
    
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
        .populate({path:'from',select:'email'})
    
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
       
        const ad=await ADS.findById(request.AD)
        console.debug(request)
       if(request.RequestData.status==0){
            console.debug('add it for the first time')
            ad.NotAvilable.push({
                startDate:request.RequestData.StartDate,
                EndDate:request.RequestData.EndDate,
                requestId:request._id
    
            })
            await ad.save()
        }else if(request.RequestData.status==1){
            var message='request already accepted'
            if(req.user.lang==1){
                message='لقد قمت بالموافقة علي هذا الطلب'
            }
            return res.status(200).json({state:0,msg:message})
        }else{
            return res.status(422).json({state:0,msg:'invalid request'})
        }



      
        request.RequestData.status=1;
        await request.save();
        var message='request accepted'
            if(req.user.lang==1){
                message='تم الموافقة علي الطلب'
            }
        res.status(200).json({state:1,msg:message})

         const data={
           RequestId:request._id,
       }
       var notification={
           title:'your request is accepted',
           body:`${req.user.name} accepted your request to rent ${ad.title}`
       }

            if(request.from.lang==1){
                notification={
                    title:'تم الموافقة علي طلبك',
                    body:`${ad.title} وافق علي طلب تاجير  ${req.user.name} `
                }
            }

        
       console.debug(request.from.email)

        await notificationSend("RequestAccepted",data,notification,request.from._id,0)

        var Emessage=`<h4>${req.user.name} accepted your request  to rent ${ad.title} 
        check your account
        </h4>`

        if(request.from.lang==1){
            Emessage=`
            <h4> ${ad.title} وافق علي طلب تاجير  ${req.user.name}
        افحص حسابك
        </h4>
            
            `
        }


        await sendEmail(request.from.email,'Request accepted',Emessage)
 
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
        .populate({path:'AD',select:'title'})
        .populate({path:'from',select:'email'})
    
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

        if(request.RequestData.status!=0){
            const error = new Error('you can not refuse this request ');
            error.statusCode = 422 ;
            return next( error) ;

        }

        request.RequestData.status=-1;
        request.refuseMassage=message
       await request.save();

        res.status(200).json({state:1,msg:'request disagreed'})

        const data={
            RequestId:request._id,
            message:message
        }
        const notification={
            title:'your request is refused',
            body:`${req.user.name} refused your request to rent ${request.from.title}`
        }
        
             if(request.from.lang==1){
                 notification={
                     title:'تم رفض علي طلبك',
                     body:`${ad.title} رفض طلب استاجر  ${req.user.name} `
                 }
             }
 
 
         await notificationSend("RequestRefused",data,notification,request.from._id,0)

         var Emessage=`<h4>${req.user.name} Refused your request  to rent ${ad.title} 
         check your account
         </h4>`
 
         if(request.from.lang==1){
             Emessage=`
             <h4> ${ad.title} رفض طلب تاجير  ${req.user.name}
         افحص حسابك
         </h4>
             
             `
         }


         await sendEmail(request.from.email,'Request refused',Emessage)


    }catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    
}

   

}

const getMyProfile=async(req,res,next)=>{
    try{
        
        const user=await TrederUsers.findById(req.userId)
        .select('name')
        .select('email')
        .select('photo')
        .select('status')
        .select('method')
        .select('emailVerfied')
        .select('lang')
        

          res.status(200).json({state:1,user:user})
        
           
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const editMyProfile=async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        var {name,email,lang}=req.body
        var EMAIL=req.body.email.trim().toLowerCase()
        email     = EMAIL;
       var imageUrl 
       if( req.files[0]){
        imageUrl = req.files[0].filename;
       }
       
        //console.debug(req.files,req.file)
        var user=await TrederUsers.findById(req.userId)
        if(email&&user.methods!='local'){

            const error = new Error('you cant edit your email');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 

        }

        if(email!=user.email){
            user.emailVerfied=false
        }

        user.name=name||user.name
        user.email=email||user.email
        user.local.email=email||user.email
        user.photo=imageUrl||user.photo
        user.lang=lang||user.lang
       
        await user.save()
        
        
        

          res.status(200).json({state:1,msg:"user info updated"})
        
           
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const getLatestReviews=async(req,res,next)=>{
    try{
        const page = req.query.page *1 || 1;
         const itemPerPage = 10; 
        var user=await TrederUsers.findById(req.userId)
        .populate({ path: 'MyWonAds', populate: { path: 'Rate'},select:'Rate'})
        .populate({ path: 'MyWonAds', populate: { path: 'Rate.user'},select:'user.name'})
       .select('Rate')
        
        var fUser=user.MyWonAds.filter(data=>{
            if(data.Rate.length>0){
               
               return data.Rate

            }
           
        })
        //console.debug('fuser is 0',fUser[0].Rate[1].user)
      //  console.debug('fuser is 1',fUser[1].Rate[0].user)
       fUser=fUser.map((data,index)=>{
       console.debug(data.Rate.length)
         //  console.debug(data.Rate[index])
        var fobj= data.Rate.map(elem=>{
            //console.debug(data)
            var obj= {
                name:elem.user.name,
                userid:elem.user._id,
                star:elem.userRate,
                adid:data._id,
                date:elem.date,
                dateMs:`${Date.parse(elem.date)}`


                
            }
            return obj

        })
           

        return fobj

         })
         var arrayOfAllObj=[]
         fUser.forEach(arr=>{
             arr.forEach(obj=>{
                 if(!obj.date){
                    obj.date='2020-01-16T23:51:23.247Z'
                 }
                arrayOfAllObj.push(obj)
             })
         })

         arrayOfAllObj.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.date) - new Date(a.date);
          });
          var TotalReviws=arrayOfAllObj.length
          var Limited=paginate(arrayOfAllObj,itemPerPage,page)


          res.status(200).json({state:1,user:Limited,TotaNum:TotalReviws})
        
           
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const contactSupport=async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {message}=req.body
        const newIsuue=new Isuue({
            Tuser:req.userId,
            message
        })
      await newIsuue.save()
      res.status(200).json({state:1,msg:'isuue created successfuly'})


       
        }catch(err){
            //console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const putItemToCart=async(req,res,next)=>{
    try{
        //console.debug(req.userId)
        
        var {ProductId,Needed}=req.body
        console.debug(req.body)
        Needed=Number(Needed)
        if(!Needed||Needed<=0){
            console.debug(Needed)
            var message='invalid quantaty'
            if(req.user.lang==1){
                message='كمية غير صحيح'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }
        Needed=Math.abs(Needed)
        const product=await Product.findById(ProductId)
        if(!product){
            const error = new Error('product not found');
            error.statusCode = 422 ;
            return next(error) ; 
    
        }
        const user=await TrederUsers.findById(req.userId)
        if(!user){

            const error = new Error('user not found');
            error.statusCode = 422 ;
            return next(error) ; 


        }
       //user.cart=[]
//      await user.save()
        
        if(product.avilableNumber<=0){
            var message='sorry product out of stock'
            if(req.user.lang==1){
                message='لقد نفذة الكمية من هذا المنج'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }
        var foundAndseted=false
        var editCart=user.cart.map(obj=>{
            if(obj.product._id.toString()==ProductId.toString()){

                if(product.avilableNumber<obj.numberNeeded+Needed){
                    var message='sorry you cant pay this amount right now'
                    if(req.user.lang==1){
                        message='لا يمكنك شراء هذه الكمية الان'
                    }
                     const error = new Error(message);
                     error.statusCode = 422 ;
                     throw next(error) ; 
                    //return res.status(422).json({state:0,msg:'sorry you cant pay this amount right now'})

                }
                obj.numberNeeded+=Needed;
              
                foundAndseted=true
                return obj
            }
            return obj
        })
       // console.debug(editCart)
         if(foundAndseted){
             //console.debug('it exist and its mm run')
             user.cart=editCart
            // console.debug('user',user.cart)
           await user.save();
           foundAndseted=false

           var message='the item added to the cart'
           if(req.user.lang==1){
               message='تم اضافة المنتج بنجاح'
           }
            
            return res.status(200).json({state:1,msg:message})
           

        }
        else{
            console.debug("else run")
            if(Needed>product.avilableNumber){

                var message='sorry you can not pay this amount'
                if(req.user.lang==1){
                    message='لا يمكنك شراء هذه الكمية الان'
                }

                return res.status(422).json({state:0,msg:message})

            }

             user.cart.push({
                numberNeeded:Needed,
                product:ProductId,
         })

         await user.save()
         var message='the item added to the cart'
         if(req.user.lang==1){
             message='تم اضافة المنتج بنجاح'
         }
         return res.status(200).json({state:1,msg:message})

      
        
         }
      

           
       
        }catch(err){
            //console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}


const getCartItems=async(req,res,next)=>{
    try{
        
            const usercart=await TrederUsers.findById(req.userId)
            .populate({path:'cart'})
            .populate({path:'cart.product',select:'images price title avilableNumber'})
            .select('cart')            

        

         res.status(200).json({state:1,Cart:usercart.cart})
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
    }
}

const decreseCartItem=async(req,res,next)=>{
    try{
        
        const {ProductId}=req.body
        console.debug('req.body',req.body)
        const product=await Product.findById(ProductId)
        if(!product){
            const error = new Error('product not found');
            error.statusCode = 422 ;
            return next(error) ; 
    
        }
        const user=await TrederUsers.findById(req.userId)
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
        var foundAndseted=false
        var deleteIndex;
        var deleteItem=false
        var editCart=user.cart.map((obj,index)=>{
            if(obj.product._id.toString()==ProductId.toString()){
                if(obj.numberNeeded>=2){
                    obj.numberNeeded-=1;
              
                foundAndseted=true
                return obj
                }else{
                    deleteItem=true;
                    deleteIndex=index
                    return obj
                }
                
                
            }
            return obj
        })
         if(foundAndseted){
             console.debug('it exist and its mm run')
             user.cart=editCart
             console.debug('user',user.cart)
           await user.save();
           foundAndseted=false
           
            return res.status(200).json({state:1,msg:'the decresed from  cart'})
            
            

        }

            if(deleteItem){
                user.cart.splice(deleteIndex,1)
                deleteItem=false
                await user.save()
                return res.status(200).json({state:1,msg:'the item deleted'})

            }
        

          

          res.status(422).json({state:0,msg:'cant decrese this is item ,item not foun in your cart'})
        
           
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}
const MakeOrder=async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {paymentMethod,cartPrice,usedPromoCode,finalPrice,descPerc,address,paymentId}=req.body
        var checkoutId=paymentId
        const user =await TrederUsers.findById(req.userId)
        .populate({ path: 'cart', populate: { path: 'product'}})

        if(!user){
            const error = new Error('user not found');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        if(user.cart.length<=0){
            const error = new Error('cart is empty');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        
        if(paymentMethod=='cach'){
            const NewPayMent=new Payment({
                Tuser:user._id,
                methodOfPay:'cach',
                totalMoney:cartPrice,
                finalPrice:finalPrice,
                descPerc:descPerc
            })
            await NewPayMent.save()
            const order=new Order({
                Tuser:user._id,
                cart:user.cart,
                payment:NewPayMent._id,
                address:address,

            })
            await order.save()
           // console.debug(user.cart)
           
            for(let elem of user.cart){
            
                const editProduct= await Product.findById(elem.product._id)
               editProduct.avilableNumber-=elem.numberNeeded
               editProduct.sold+=elem.numberNeeded
                   await editProduct.save()
            }
            user.cart=[]
            user.Orders.push(order._id)
            await user.save()

           return res.status(200).json({state:1,msg:'order created succesfuly'})

        }else if(paymentMethod=='elec'){
            if(!checkoutId){
                var message='checkoutId is required'
                const error = new Error(message);
                error.statusCode = 422 ;
                return next(error) ; 
                }
                
                const {body,status}=await getPaymentReport(checkoutId)
            if(body.result.code.toString()!='000.100.110'){
            var message='invalid payment checkout '
            const error = new Error(message);
            error.statusCode = 422 ;
        return next(error) ; 
            }
            const NewPayMent=new Payment({
                cuser:user._id,
                methodOfPay:'elec',
                totalMoney:cartPrice,
                finalPrice:finalPrice,
                status:1,
                descPerc:descPerc,
                checkoutId
            })
            await NewPayMent.save()
            const order=new Order({
                cuser:req._id,
                cart:user.cart,
                payment:NewPayMent._id,
                address:address,

            })
            await order.save()
           // console.debug(user.cart)
           
            for(let elem of user.cart){
            
                const editProduct= await Product.findById(elem.product._id)
               editProduct.avilableNumber-=elem.numberNeeded
               
                   await editProduct.save()
            }
            user.cart=[]
            await user.save()

            res.status(200).json({state:1,msg:'order created succesfuly'})
            
        }else{
            res.status(422).json({state:1,msg:'invalid payment method'})
        }
       


       
        }catch(err){
            //console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const getNotifications=async(req,res,next)=>{
    try{
        const page = req.query.page *1 || 1;
        const status=req.query.status
        const itemPerPage = 10;
        
        const userCount=await TrederUsers.findById(req.userId)
        const TotaNum=userCount.notfications.length


        const user=await TrederUsers.findById(req.userId)
        // .populate({path: 'notfications', options: { sort:'desc' } ,select:'notification action data createdAt'})
        // .select('notfications')
        // .skip((page - 1) * itemPerPage)
        // .limit(itemPerPage)
        .populate([
            // here array is for our memory. 
            // because may need to populate multiple things
            {
                path: 'notfications',
                select: 'notification action data createdAt',
                
                options: {
                    sort:{'createdAt': -1},
                    skip: (page - 1) * itemPerPage,
                    limit : itemPerPage,
                    lean: true
                },
                match:{
                    // filter result in case of multiple result in populate
                    // may not useful in this case
                },
                 //populate: { path: 'services.serviceType'}

            },

           

        ]).select('notfications')
        
        await user.notfications.forEach(async obj=>{
            var ms= await Date.parse(obj.createdAt)
             obj.createdAtMS=`${ms}`
         })
          res.status(200).json({state:1,notfications:user.notfications,TotaNum})
        
           
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const DeleteCartItem=async(req,res,next)=>{
    try{
        
        const {CartItemId}=req.body
        var user=await TrederUsers.findById(req.userId)
        if(!user){

            const error = new Error('user not found');
            error.statusCode = 422 ;
            return next(error) ; 


        }
       var delIndex=-1
       user.cart.forEach((obj,index)=>{
           if(obj._id.toString()===CartItemId.toString()){
            delIndex=index
           }
       })
       if(delIndex<0){
        return res.status(200).json({state:1,msg:'item not found in your cart'})

       }
       user.cart.splice(delIndex, 1)
          await user.save()
          return res.status(200).json({state:1,msg:'item deleted from cart'})

       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}
const getMyOreder=async(req,res,next)=>{
    try{
    
        const page = req.query.page *1 || 1;
        const itemPerPage = 10; 
        const OrderID=req.query.OrderID
        if(OrderID){
            const order=await Order.findById(OrderID)
          // .populate({ path: 'cart', populate: { path: 'cart.product' ,select:'price images title'}})
            .populate({ path: 'payment', select:'methodOfPay finalPrice'})
              .populate({path:'cart.product',select:'images title price desc'})
            if(!order){
               return res.status(404).json({state:0,msg:'order not found'})
            }
            return res.status(200).json({state:1,order})

        }
    const user=await TrederUsers.findById(req.userId)
    .populate('Orders')
    .populate({ path: 'Orders', populate: { path: 'payment' ,select:'methodOfPay finalPrice'}})
    var lmitedData=paginate(user.Orders,itemPerPage,page)
    limetedData=lmitedData.sort((a,b)=>{
        return b.createdAt-a.createdAt
    })
    var totalOrders=user.Orders.length
    console.debug(user._id)
   res.status(200).json({state:1,Orders:lmitedData,TotaNum:totalOrders})
     
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const suggest=async(req,res,next)=>{

    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {suggest}=req.body
       
       const sug =new Suggest({
        Tuser:req.userId,
        suggest
       })
       await sug.save()
       var message='suggest sent'
       if(req.user.lang==1){
           message='تم ارسال الاقتراح'
       }
       res.status(200).json({message})
       
        }catch(err){
            //console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const MoneyWithDrawRequest=async(req,res,next)=>{

    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        var{
            RequiredWithdrowMoney,
            FullName,
            Address,
            BankName,
            AccountNumber,
            BankCode,
            MobileNumber,
            Email
        
        
        }=req.body

        console.debug(req.body)

        // validate name
       
         // validate email
         Email=Email.toLowerCase()
    

        // validate mobile
    
        // check amount of money he wants
        //1 check price is valid
        if(!Number(RequiredWithdrowMoney)||Number(RequiredWithdrowMoney)<=0){
            var message='invalid price'
            if(req.user.lang==1){
                message='سعر غير صحيح'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }

        //2 find if he has wallet
      var  wallet=await Wallet.findOne({
            user:req.userId.toString()
        })

        if(!wallet){
            var message='wallet not found'
            if(req.user.lang==1){
                message='لم يتم اجاد المحفظة'
            }
            const error = new Error(message);
            error.statusCode = 500 ;
            return next(error) ; 
        }
        //3 check if he has credit
        if(wallet.TotalPrice==0){
            var message='you have no credit'
            if(req.user.lang==1){
                message='ليس لديك رصيد  '
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }
        //4 check if the requested money is bigger than his credit 
        if(wallet.TotalPrice<Number(RequiredWithdrowMoney)){
            var message='your wallet cridt does not allow that'
            if(req.user.lang==1){
                message='رصيد محفظتك لا يسمح بذاك'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }
        //5 check if he has pendig money requests
        var checkWithDrowl=await Withdraw.findOne({
            user:req.userId.toString(),
            RequestStatus:{ $ne: 2 }
        })

        if(checkWithDrowl){
            var message='you requested money already wait till you recive it then try again'
            if(req.user.lang==1){
                message='لقد قمت بعملية سحب انتظر حتي تستلم المبلغ ثم حاول مجددا'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }

    // create request 
        var newWithdraw=new Withdraw({
            user:req.userId.toString(),
            TotalWalletMoney:wallet.TotalPrice,
            RequiredWithdrowMoney,
            FullName,
            Address,
            BankName,
            AccountNumber,
            BankCode,
            MobileNumber,
            Email,
           
        

        })
       await newWithdraw.save()
       wallet.withDarwRequest.push(newWithdraw)
       await wallet.save()
       var message='request created '
       if(req.user.lang==1){
           message='تم ارسال الطلب'
       }
       res.status(200).json({message})
       
        }catch(err){
            //console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const getMyWallet=async(req,res,next)=>{
    try{
        const page = req.query.page *1 || 1;
        const itemPerPage = 10;
        
        const user=await TrederUsers.findById(req.userId)
        if(!user){
            const error = new Error('user not found');
            error.statusCode = 422 ;
            return next(error) ; 
        }
        
        var  wal=await Wallet.findOne({
            user:req.userId
        })
        console.debug('wal',wal)
        var TotalNum=wal.withDarwRequest.length
        var  wallet=await Wallet.findOne({
            user:req.userId
        })
        .populate([
            // here array is for our memory. 
            // because may need to populate multiple things
            {
                path: 'withDarwRequest',
                select: 'RequiredWithdrowMoney RequestStatus',
                
                options: {
                    sort:{'createdAt': -1},
                    skip: (page - 1) * itemPerPage,
                    limit : itemPerPage,
                    lean: true
                },
                match:{
                    // filter result in case of multiple result in populate
                    // may not useful in this case
                },
                 //populate: { path: 'services.serviceType'}

            },

           

        ]).select('-user')

        if(!wallet){
            const error = new Error('no wallet found to this user');
            error.statusCode = 422 ;
            return next(error) ; 
        }
        res.status(200).json({wallet,TotalNum})
           
       
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
disAgree,
getMyProfile,
editMyProfile,
getLatestReviews,
contactSupport,
putItemToCart,
getCartItems,
decreseCartItem,
MakeOrder,
getNotifications,
DeleteCartItem,
getMyOreder,
suggest,
MoneyWithDrawRequest,
getMyWallet

}