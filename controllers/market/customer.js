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
const CustomerUser=require('../../models/CustomerUser')
const trederUser=require('../../models/TrederUsers')
const Product=require('../../models/shopProducts')
const AvilableServices=require('../../models/AvilableServices')
const Request=require('../../models/Request');
const { use } = require('passport');
const paginate=require('../../helpers/general/helpingFunc').paginate
const Payment=require('../../models/payment')
const Order=require('../../models/order')
const Isuue=require('../../models/isuues');
const payment = require('../../models/payment');
const notificationSend=require('../../helpers/send-notfication').send
const sendEmail=require('../../helpers/sendEmail').sendEmail
const Suggest=require('../../models/suggest')
const getPaymentReport=require('../../controllers/general/payment').getPaymentReport
const Wallet =require('../../models/wallet')
const Money=require('../../models/money')
const Address=require('../../models/address')
function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[2], mdy[0]-1, mdy[1]);
}

function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

const Book=async (req,res,next)=>{
    console.debug('request body',req.body)
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

       var {AdId,StartDate,EndDate,Adult,children,services,finalPrice,ArivalTime,gender}=req.body
            StartDateD =new Date(Number(StartDate))
            EndDateD =new Date(Number(EndDate))

       if(StartDateD.toString() ==='Invalid Date'||EndDateD.toString()==='Invalid Date'){
        var message='invalid date'
        if(req.user.lang==1){
            message='تاريخ غير صحيح'
        }
        const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 

       }

       if(StartDateD<= Date.now()){

        var message='start date cannot be in the past'
        if(req.user.lang==1){
            message='لا يمكن لتاريخ البداء ان يكون في الماضي '
        }

        const error = new Error(message);
        error.statusCode = 422 ;
        return next(error) ; 

       }
       
       if(StartDateD>EndDateD){
        
        var message='end date cannot be less than start date'
        if(req.user.lang==1){
            message='لا يمكن لتاريخ الانتهاء ان يكون قبل تاريخ البدء '
        }

        const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 


       }

       if(Adult<=0&&children<=0){
        var message='invalid adult or chiled'
        if(req.user.lang==1){
            message='بينات خاطئة'
        }
        const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 


       }



       const reque=await Request.findOne({
           from:req.userId,
           AD:AdId
       })
       console.debug('fucken request',reque)
       if(reque!=null&&Number(reque.RequestData.EndDate)>=Date.now()){
        var message='you alreay requested this ad'
        if(req.user.lang==1){
            message='لقد قمت بطلب هذا المنتج من قبل'
        }
         const error = new Error(message);
            error.statusCode = 422 ;
            return next(error); 

       }

       console.debug('ad id',AdId)
       const ad=await ADS.findById(AdId)
       if(!ad){

        const error = new Error('ad not found');
            error.statusCode = 404 ;
            return next( error) ;

       }
       console.debug('start date',StartDate)
       console.debug('end date',EndDate)


        var areadyToken=false
        console.debug("areadyToken ",areadyToken)
        ad.NotAvilable.forEach(data=>{
            console.debug('data ',data)
            console.debug('data.satrtDate ',data.startDate)
            console.debug('data.EndDate ',data.EndDate)
            console.debug('EndDate ',EndDate) 
            console.debug('startDate ',StartDate)
            console.debug('first',Number(StartDate)>=Number(data.startDate)&&Number(StartDate)<=Number(data.EndDate))
            if(Number(StartDate)>=Number(data.startDate)&&Number(StartDate)<=Number(data.EndDate)){
            areadyToken=true;
            console.debug("if run ",areadyToken)
            
        }


        console.debug('second',Number(EndDate)>=Number(data.startDate)&&Number(EndDate)<=Number(data.EndDate))

            if(Number(EndDate)>=Number(data.startDate)&&Number(EndDate)<=Number(data.EndDate)){
             areadyToken=true
             console.debug("if run from second loop",areadyToken)
           }
        })

        if(areadyToken){
         var message='this appartement is not avilable in that date '
         if(req.user.lang==1){
             message='هذا المنتج غير متاح في هذا التاريخ'
        }
         const error = new Error(message);
         error.statusCode = 404 ;
         return next( error) ;
        }





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

       var editTreder=await trederUser.findById(ad.Creator)
       editTreder.income.total+=finalPrice
       editTreder.income.source.push(newRequest._id)
       await editCustomer.save()
       
       const data={
           RequestId:newRequest._id,
       }


       var notification={
           title:'you have recived a new request',
           body:`${editCustomer.name} wants to rent ${ad.title}`
       }
       if(editCustomer.lang==1){
        notification={
            title:'لقد تلقيت طلب جديد',
            body:` ${ad.title} يريد ان يستأجر ${editCustomer.name}`
        }
       }

      // var month = statrt. getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12.
     //var year = d. getFullYear();
     //var dateStr = date + "/" + month + "/" + year;
     var message='request sent'
        if(req.user.lang==1){
            message='تم ارسال الطلب'
        }
       res.status(200).json({state:1,msg:message})
      await notificationSend("RequestRecived",data,notification,ad.Creator,1)
      var Emessage=`
      <h4>${editCustomer.name} wants to rent ${ad.title} 
      check your account
      </h4>
     
     `
      if(req.user.lang==1){
          Emessage=`
          <h4>${ad.title} يريد ان يستأجر ${editCustomer.name}
          تفقد حسابك
          </h4>
         
         `
      }
       await sendEmail(editTreder.email,'New Request',Emessage)


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
    const status=req.query.status
    const itemPerPage = 10;
    // const customer=await CustomerUser.findById(req.userId)
    // .select('pendingRequestTo')
    // .populate('pendingRequestTo')
    // .populate({ path: 'pendingRequestTo', populate: { path: 'to'}})
    // .populate({ path: 'pendingRequestTo', populate: { path: 'AD'}})
    // .populate({ path: 'pendingRequestTo', populate: { path: 'RequestData.services.serviceType'}})
    // .populate({ path: 'pendingRequestTo', populate: { path: 'Payment',select:'status finalPrice methodOfPay'}})
    const TotaNum=await Request.find({
        from:req.userId,
         "RequestData.status": status|| {$exists:true},  
    }).countDocuments()
    const request=await Request.find({
        from:req.userId,
         "RequestData.status": status|| {$exists:true},  
    })
    .populate({ path: 'to',select:'name mobile '})
     .populate({path: 'AD'})
     .populate('RequestData.services.serviceType')
     .populate({path:'Payment',select:'status finalPrice methodOfPay'})
     .skip((page - 1) * itemPerPage)
     .limit(itemPerPage)
     .lean()
    
    var mapedLimitedResult=request.map(oldObj=>{ 
        var FResult={}
        if(!oldObj.AD){
            
            return 
        }
    var StartDate=oldObj.RequestData.StartDate
    var EndDate=oldObj.RequestData.EndDate
   // var StartDateMS= Date.parse(StartDate)
   // var EndDateMS= Date.parse(EndDate)
    var renterPhone=oldObj.to.mobile
    var renterName=oldObj.to.name
    var title=oldObj.AD.title
    var city=oldObj.AD.city 
    var streetAdress= oldObj.AD.streetAdress
    var RequestId=oldObj._id
    var status=oldObj.RequestData.status
    var Adult=oldObj.RequestData.Adult
    var children=oldObj.RequestData.children
    var FinalservicePrice=oldObj.RequestData.FinalservicePrice
    var finalPrice=oldObj.RequestData.finalPrice
    var services=oldObj.RequestData.services  
    var payment=oldObj.Payment
    var NotAvilable=oldObj.AD.NotAvilable
    console.debug('payment',oldObj.payment)
    const NumOfDays=datediff( Date.now(),StartDate)  
    //var InFuture=StartDate >Date.now() ?true:false
    //var InPast=EndDate <Date.now() ?true:false
    var canRate=StartDate<Date.now()&&oldObj.RequestData.status==1
    var arivalTime=oldObj.RequestData.ArivalTime
    //var message=oldObj.refuseMassage
    var adId=oldObj.AD._id
    var AdPrice=oldObj.AD.price
    var AdServices=oldObj.AD.services
    var CanReschedule=oldObj.RequestData.status==0&&NumOfDays>0?true:false
    console.debug(oldObj.Payment==true)
    var CanPay=(!oldObj.Payment&&oldObj.RequestData.status==1)?true:false
         FResult={
        StartDate,
        EndDate,
        renterPhone,
        renterName,
        title,
        RequestId,
        status,
        AdPrice,
        AdServices,
        arivalTime,
      // message,
        adId,
        city,
        streetAdress,
        canRate,
        NumOfDays,
        services,
        Adult,
        FinalservicePrice,
        finalPrice,
        children,
        CanReschedule,
        CanPay,
        payment,
        NotAvilable
     //   StartDateMS,
        //EndDateMS

        

    }

        return FResult



     })

    
      
    res.status(200).json({state:1,Result:mapedLimitedResult,TotaNum})
    



       
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
            var message='validation faild'
            if(req.user.lang==1){
                message='بينات غير صحيحة'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

       var {RequestId,StartDate,EndDate,Adult,children,services,FinalservicePrice,finalPrice,ArivalTime}=req.body
       StartDateD =new Date(Number(StartDate))
       EndDateD =new Date(Number(EndDate))
        
       if(StartDateD.toString() ==='Invalid Date'||EndDateD.toString()==='Invalid Date'){
        var message='invalid date'
        if(req.user.lang==1){
            message='تاريخ غير صحيح'
        }
        const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 

       }

       if(StartDateD<= Date.now()){
        var message='start date cannot be in the past'
        if(req.user.lang==1){
            message='لا يمكن لتاريخ البدء ان يكون في الماضي'
        }
        const error = new Error(message);
        error.statusCode = 422 ;
        return next(error) ; 

       }
       
       if(StartDateD>=EndDateD){
        var message='end date cannot be less than start date'
        if(req.user.lang==1){
            message='لا يمكن لتاريخ البدء ان يكون ان يكون بعد تاريخ الانتهاء'
        }
        const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 


       }

       if(Adult<=0&&children<=0){
        var message='invalid adult or chiled'
        if(req.user.lang==1){
            message='بينات خاطئة'
        }
        const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 


       }


       var request=await Request.findById(RequestId)
       if(!request){
        const error = new Error('request not found');
            error.statusCode = 404 ;
            return next( error) ;

       }

       if(request.RequestData.status==1){
        var message='your request is aready accepted you can not reschedule'
        if(req.user.lang==1){
            message='لقد تم قبول الطلب لايمكن تعديله'
        }
        const error = new Error(message);
        error.statusCode = 404 ;
        return next( error) ;
       }
       const ad=await ADS.findById(request.AD)
       var StartDate=StartDate
       var EndDate=EndDate
       var areadyToken=false
       console.debug("areadyToken ",areadyToken)
       ad.NotAvilable.forEach(data=>{
           console.debug('data ',data)
           console.debug('data.satrtDate ',data.startDate)
           console.debug('data.EndDate ',data.EndDate)
           console.debug('EndDate ',EndDate) 
           console.debug('startDate ',StartDate)
           console.debug('first',Number(StartDate)>=Number(data.startDate)&&Number(StartDate)<=Number(data.EndDate))
           if(Number(StartDate)>=Number(data.startDate)&&Number(StartDate)<=Number(data.EndDate)){
           areadyToken=true;
           console.debug("if run ",areadyToken)
           
       }


       console.debug('second',Number(EndDate)>=Number(data.startDate)&&Number(EndDate)<=Number(data.EndDate))

           if(Number(EndDate)>=Number(data.startDate)&&Number(EndDate)<=Number(data.EndDate)){
            areadyToken=true
            console.debug("if run from second loop",areadyToken)
          }
       })

       if(areadyToken){
        var message='this appartement is not avilable in that date '
        if(req.user.lang==1){
            message='هذا المنتج غير متاح في هذا التاريخ'
       }
        const error = new Error(message);
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
            status:0
           }
           // find and delete this req from ad
        //    var index;
        //   AD.NotAvilable.forEach((data,ind)=>{
        //     if( data.requestId.toString()==requestId){
        //         index=ind
        //     }
        //    });
        //    if(index>-1){
        //     // AD.NotAvilable[index].StartDate=StartDate
        //     // AD.NotAvilable[index].EndDate=EndDate




        //    }
        //    else{
        //     AD.NotAvilable.push({
        //         requestId,
        //         EndDate,
        //         startDate
        //     })
        //    }
          // await AD.save()
          

            // if (index > -1) {
            //     array.splice(index, 1);
            //     }





           //

       
       console.debug("requested data",request.RequestData)
       await request.save()
       var message='request edited'
        if(req.user.lang==1){
            message='تم تعديل الطلب'
        }
       res.status(200).json({state:1,msg:message})



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
         const error = new Error('user id doesnt match request sender id');
         error.statusCode = 404 ;
         return next( error) ;

     }
     console.debug(request.RequestData.status)
     if(request.RequestData.status!=1){
        var message='you cant rate this ad'
        if(req.user.lang==1){
            message='لا يمكنك تقيم هذا المنتج'
        }
         const error = new Error(message);
         error.statusCode = 404 ;
         return next( error) ;

     }
     if(request.StartDate>Date.now()){
        var message='you can not rate this ad wait when your vication start'
        if(req.user.lang==1){
            message='لا يمكنك تقيم هذا المنتج انتظر حتي تبداء عطلتك'
        }
         const error = new Error(message);
         error.statusCode = 404 ;
         return next( error) ;

     }
     if(request.RateState.status==1){
        var message='you can not rate agin you already rated this ad'
        if(req.user.lang==1){
            message='لا يمكنك تقيم هذا المنتج لقد قمت بتقيمه بالفعل'
        }
         const error = new Error(message);
         error.statusCode = 404 ;
         return next( error) ;

     }

    const rateAd=await ADS.findById(request.AD)
    .populate('Creator')
    rateAd.Rate.addToSet({user:req.userId,userRate:star,date:Date.now()})
    var sumOfRates=0
    rateAd.Rate.forEach(element => {
        sumOfRates+=element.userRate
    })
    rateAd.star=sumOfRates/rateAd.Rate.length
    console.debug(rateAd.star)
    //rateAd.Rate.date=Date.now()
    await rateAd.save()
    request.RateState.status=1
    request.RateState.star=star
    await request.save()
    res.status(200).json({state:1,msg:'you rated successfuly'})

    const data={
     
    }
   var  notification={
        title:'new user rated your AD',
        body:`${req.user.name} rated ${rateAd.title} with  ${star} stars`
    }
   
        if(req.user.lang==1){
            notification={
                title:'لقد قام مستخدم جديد بتقيم منتجك',
                body:` نجمة  ${star} ب  ${rateAd.title} قيم  ${req.user.name}`
            }
        }


     await notificationSend("NewRate",data,notification,rateAd.Creator,1)
        
     var Emassage=`
      <h4>${req.user.name}  rated ${rateAd.title} with  ${star} stars 
      
      </h4>
     
     `
     if(req.user.lang==1){
        Emassage=`
        <h4>
        $  نجوم  ${star}  ب ${rateAd.title} قيم ${req.user.name}
        
        </h4>
       
       `
    }
     
     await sendEmail(rateAd.Creator.email,'NewRate',Emassage)




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
        //console.debug(req.userId)
        
        var {ProductId,Needed}=req.body
        console.debug('body data is',req.body)
        console.debug('user id is ',req.userId)
        Needed=Number(Needed)
        if(!Needed){
           // console.debug(Needed)
            const error = new Error('invaid number ');
            error.statusCode = 422 ;
            return next(error) ; 
        }
        Needed=Math.abs(Needed)
        const product=await Product.findById(ProductId)
        console.debug(product)
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
       //user.cart=[]
//      await user.save()
        
        if(product.avilableNumber<=0){
            var message='sorry product out of stock'
            if(req.user.lang==1){
                message='لقد نفذ المنتج'
            }
            const error = new Error(message);
            error.statusCode = 422 ;
            return next(error) ; 
        }
        var foundAndseted=false
        var editCart=user.cart.map(obj=>{
            if(obj.product._id.toString()==ProductId.toString()){

                if(product.avilableNumber<obj.numberNeeded+Needed){
                    console.debug(product.avilableNumber,obj.numberNeeded+Needed)
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
                       message='تم اضافة المنتج'
                   }    
            return res.status(200).json({state:1,msg:message})
           

        }
        else{
            console.debug("else run")
            if(Needed>product.avilableNumber){
                var message='sorry you cant pay this amount right now'
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
                       message='تم اضافة المنتج'
                   }    
         return res.status(200).json({state:1,msg:message})

      
        
         }
      

           
       
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
            var message='sorry product out of stock'
            if(req.user.lang==1){
                        message='لقد نفذ المنتج'
                    }    
            const error = new Error(message);
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
           var message='the decresed from  cart'
            if(req.user.lang==1){
                        message='لقد نقص المنتج'
                    }    
            return res.status(200).json({state:1,msg:message})
            
            

        }

            if(deleteItem){
                user.cart.splice(deleteIndex,1)
                deleteItem=false
                await user.save()
                var message='item deleted'
            if(req.user.lang==1){
                        message='تم مسح المنتج'
                    }   
                return res.status(200).json({state:1,msg:message})

            }
        

          

          res.status(422).json({state:0,msg:'cant decrese this item ,item not found in your cart'})
        
           
       
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
        var user=await CustomerUser.findById(req.userId)
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
          var message='item deleted'
          if(req.user.lang==1){
                      message='تم مسح المنتج'
                  }   
          return res.status(200).json({state:1,msg:message})

       
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
            
        
        const user=await CustomerUser.findById(req.userId)
        .select('name')
        .select('email')
        .select('photo')
        .select('status')
        .select('emailVerfied')
        .select('lang')
        .select('methods')
        
        console.log(user)
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
        var user=await CustomerUser.findById(req.userId)
        console.debug(user.methods)
        if(email&&user.methods!='local'){
            var message='you can not edit your email'
            if(req.user.lang==1){
                        message='لا يمكنك تعديل الايميل الخاص بك'
                    }   
            const error = new Error(message);
            
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
        
        
        var message='user info updated'
        if(req.user.lang==1){
                    message='تم تعديل البينات بنجاح'
                } 

          res.status(200).json({state:1,msg:message})
           
       
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

        const {paymentMethod,cartPrice,finalPrice,descPerc,address,paymentId}=req.body
       var checkoutId= paymentId
        const user =await CustomerUser.findById(req.userId)
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
                Cuser:user._id,
                methodOfPay:'cach',
                totalMoney:cartPrice,
                finalPrice:finalPrice,
                descPerc:descPerc
            })
            await NewPayMent.save()
            const order=new Order({
                Cuser:user._id,
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
             
        var message='order created succesfuly'
        if(req.user.lang==1){
                    message='تم انشاء الطلب بنجاح'
                } 

            var newMoney=await Money.findOne({
                type:'shop'
            })
            if(!newMoney){
                newMoney=new Money({
                    type:'shop',
                   
                })

                
            }
            newMoney.TotalCach+=finalPrice;
            await newMoney.save()



            res.status(200).json({state:1,msg:message})

        }else if(paymentMethod=='elec'){

            if(!checkoutId){
                var message='checkoutId is required'
                const error = new Error(message);
                error.statusCode = 422 ;
                return next(error) ; 
                }
                
                const {body,status}=await getPaymentReport(checkoutId)
                console.debug('res body',body.result.code.toString())
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
                checkoutId,
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
                   
        var message='order created succesfuly'
        if(req.user.lang==1){
                    message='تم انشاء الطلب بنجاح'
                } 


                
            var newMoney=await Money.findOne({
                type:'shop'
            })
            if(!newMoney){
                newMoney=new Money({
                    type:'shop',
                   
                })

                
            }
            newMoney.TotalElec+=finalPrice;
            await newMoney.save()




            res.status(200).json({state:1,msg:message})
            
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
            Cuser:req.userId,
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
const getNotifications=async(req,res,next)=>{
    try{
        const page = req.query.page *1 || 1;
        const status=req.query.status
        const itemPerPage = 10;
        const userCount=await CustomerUser.findById(req.userId)
        const TotaNum=userCount.notfications.length
        const user=await CustomerUser.findById(req.userId)
        .populate({path: 'notfications', options: { sort:'desc' } ,select:'notification action data createdAt'})
        .select('notfications')
        .lean()
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
       // Object.assign(user.notfications.createdAt,Date.parse(user.notfications.createdAt))
       // user.notfications.createdAt=Date.parse(user.notfications.createdAt)
       // console.debug(Date.parse(user.notfications.createdAt))
      await user.notfications.forEach(async obj=>{
           var ms= await Date.parse(obj.createdAt)
            obj.createdAtMS=`${ms}`
        })

        //console.debug(user.notfications[0].createdAtMS)
          

          res.status(200).json({state:1,notfications:user.notfications,TotaNum})
        
           
        
           
       
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
    const user=await CustomerUser.findById(req.userId)
    .populate('Orders')
    .populate({ path: 'Orders', populate: { path: 'payment' ,select:'methodOfPay finalPrice'}})
    
    var lmitedData=paginate(user.Orders,itemPerPage,page)
    limetedData=lmitedData.sort((a,b)=>{
        return b.createdAt-a.createdAt
    })
    var totalOrders=user.Orders.length
   res.status(200).json({state:1,Orders:lmitedData,TotaNum:totalOrders})
     
       
        }catch(err){
            console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        
}
}

const PayForAppartment=async(req,res,next)=>{

    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {paymentMethod,RequestId,finalPrice,paymentId}=req.body
        var checkoutId=paymentId
        console.debug('requestID',RequestId)
            const request=await Request.findById(RequestId.toString())
            .populate({path:'to'})
            console.debug('request',request)
            if(!request){
            const error = new Error('invalid request id');
            error.statusCode = 422 ;
            return next(error) ; 
            }
            if(request.RequestData.status!=1){
                var message='sorry you can not pay now wait till your request is accespted'
                if(req.user.lang==1){
                    message='لايمكنك الدفع الان انتظر حتي يتم الموافقة علي طلبك'
                } 
                const error = new Error(message);
                error.statusCode = 422 ;
                return next(error) ; 
            }
            console.debug('req payment',request.Payment)
            if(request.Payment){
                var message='you already payed for it'
                if(req.user.lang==1){
                    message='لقد قمت بالدفع لها1ا الحجز في السابق'
                } 
                const error = new Error(message);
                error.statusCode = 422 ;
                return next(error) ; 
            }
     
        if(paymentMethod=='cach'){
            const NewPayMent=new Payment({
                Cuser:req.userId,
                methodOfPay:'cach',
                totalMoney:finalPrice,
                finalPrice:finalPrice,
                
            })
            await NewPayMent.save()
          
            
            request.Payment=NewPayMent._id
            await request.save()

            var message='payment method created succesfuly'
            if(req.user.lang==1){
                message='تم تحديد طريقة الدفع بنجاح'
            } 

            var newMoney=await Money.findOne({
                type:'market'
            })
            if(!newMoney){
                newMoney=new Money({
                    type:'market',
                   
                })

                
            }
            newMoney.TotalCach+=finalPrice;
            await newMoney.save()


            res.status(200).json({state:1,msg:message})

        }else if(paymentMethod=='elec'){
            if(!checkoutId){
                var message='checkoutId is required'
                const error = new Error(message);
                error.statusCode = 422 ;
                return next(error) ; 
            }
            console.debug('checkoutId',checkoutId)

            const {body,status}=await getPaymentReport(checkoutId.toString())
            console.debug('body',body)
            console.debug('res code',body.result.code.toString())
             if(body.result.code.toString()!='000.100.110'){
                var message='invalid payment checkout '
                const error = new Error(message);
                error.statusCode = 422 ;
                return next(error) ; 
             }

            const NewPayMent=new Payment({
                Cuser:req.userId,
                methodOfPay:'elec',
                totalMoney:finalPrice,
                finalPrice:finalPrice,
                checkoutId,
                status:1
            })
            request.Payment=NewPayMent._id
            await NewPayMent.save()
            console.debug(request.to._id.toString())
           var Twallet=await Wallet.findOne({
                user:request.to._id.toString()
            })
           if(!Twallet){
            var message='wallet not found '
            const error = new Error(message);
            error.statusCode = 500 ;
            return next(error) ; 
           }
           Twallet.TotalPrice+=Number(finalPrice)
           await Twallet.save()
           var data={}
           var notification={
            title:'new money added to your wallet',
            body:`check your wallet`
        }
        if(request.to.lang==1){
         notification={
             title:'لقد تم اضافة مال جدبد الي محفظتك',
             body:` تفقد محفظتك`
         }
        }
 
       // var month = statrt. getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12.
      //var year = d. getFullYear();
      //var dateStr = date + "/" + month + "/" + year;
      var message='payment created'
         if(req.user.lang==1){
             message='تم الدفع'
         }
         
         var newMoney=await Money.findOne({
            type:'market'
        })
        if(!newMoney){
            newMoney=new Money({
                type:'market',
               
            })

            
        }
        newMoney.TotalElec+=finalPrice;
        await newMoney.save()

        res.status(200).json({state:1,msg:message})
       await notificationSend("NewMoneyAdded",data,notification,request.to._id,1)
       var Emessage=`
       <h4>
       new money added to your wallet
       
       </h4>
      
      `
       if(req.user.lang==1){
           Emessage=`
           تم اضافة مال الي محفظتك
          
          `
       }
        await sendEmail(request.to.email,'NewMoneyAdded',Emessage)
 

            
        }else{
            res.status(422).json({state:1,msg:'invalid payment method'})
        }
       


       
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
       
       const sugest =new Suggest({
        Cuser:req.userId,
        suggest
       })
       await sugest.save()
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
const CreatAddress=async(req,res,next)=>{

    try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {N,E,title,address}=req.body

        const user=await CustomerUser.findById(req.userId)
        if(!user){
            const error = new Error('user not found');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ;
        }
       
       const newAdd =new Address({
       N,
       E,
       title,
       address
       })
       await newAdd.save()
       user.dlivaryAddress.push(newAdd._id)
       await user.save()
       var message='address sent'
       if(req.user.lang==1){
           message='تم اضافة العنوان'
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

const getMyAddress=async(req,res,next)=>{
    try{
        const page = req.query.page *1 || 1;
        const status=req.query.status
        const itemPerPage = 10;
        const userCount=await CustomerUser.findById(req.userId)
        const TotaNum=userCount.notfications.length
        const user=await CustomerUser.findById(req.userId)
        .populate({path: 'dlivaryAddress'})
        .select('dlivaryAddress')
        .lean()

          res.status(200).json({state:1,dlivaryAddress})
        
           
        
           
       
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
    Rate ,
    putItemToCart,
    getCartItems,
    decreseCartItem,
    getMyProfile,
    editMyProfile,
    MakeOrder,
    contactSupport,
    getNotifications,
    DeleteCartItem,
    getMyOreder,
    PayForAppartment,
    suggest,
    CreatAddress,
    getMyAddress

}