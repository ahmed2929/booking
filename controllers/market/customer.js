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
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

       var {AdId,StartDate,EndDate,Adult,children,services,finalPrice,ArivalTime,gender}=req.body
            StartDateD =new Date(Number(StartDate))
            EndDateD =new Date(Number(EndDate))

       if(StartDateD.toString() ==='Invalid Date'||EndDateD.toString()==='Invalid Date'){
        
        const error = new Error('invalid date');
            error.statusCode = 422 ;
            return next(error) ; 

       }

       if(StartDateD<= Date.now()){
        const error = new Error('start date cannot be in the past');
        error.statusCode = 422 ;
        return next(error) ; 

       }
       
       if(StartDateD>=EndDateD){

        const error = new Error('end date cannot be equal or less than start date');
            error.statusCode = 422 ;
            return next(error) ; 


       }
       const reque=await Request.findOne({
           from:req.userId,
           AD:AdId
       })
       if(reque){
           
        const error = new Error('you alreay requested this ad');
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

       var editTreder=await trederUser.findById(ad.Creator)
       
       const data={
           RequestId:newRequest._id,
       }
       const notification={
           title:'you have recived a new request',
           body:`${editCustomer.name} wants to rent ${ad.title}`
       }

      // var month = statrt. getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12.
     //var year = d. getFullYear();
     //var dateStr = date + "/" + month + "/" + year;
       res.status(200).json({state:1,msg:'request sent'})
      await notificationSend("RequestRecived",data,notification,ad.Creator,1)
       await sendEmail(editTreder.email,'New Request',`
        <h4>${editCustomer.name} wants to rent ${ad.title} 
        check your account
        </h4>
       
       `)


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
    console.debug('payment',oldObj.payment)
    const NumOfDays=datediff( Date.now(),StartDate)  
    //var InFuture=StartDate >Date.now() ?true:false
    //var InPast=EndDate <Date.now() ?true:false
    var canRate=StartDate<Date.now()&&oldObj.RequestData.status==1
    var arivalTime=oldObj.RequestData.ArivalTime
    //var message=oldObj.refuseMassage
    var adId=oldObj.AD._id
    
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
       // InFuture,
       // InPast,
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
        StartDateMS,
        EndDateMS

        

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

       if(request.RequestData.status==1){
        const error = new Error('your request is aready accepted you can not reschedule');
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
    res.status(200).json({state:1,msg:'you rated is success'})

    const data={
     
    }
    const notification={
        title:'new user rated your AD',
        body:`${req.user.name} rated ${rateAd.title} with  ${star} stars`
    }



     await notificationSend("NewRate",data,notification,rateAd.Creator,1)
     await sendEmail(rateAd.Creator.email,'NewRate',`
      <h4>${req.user.name}  rated ${rateAd.title} with  ${star} stars 
      
      </h4>
     
     `)




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
            const error = new Error('sorry product out of stock');
            error.statusCode = 422 ;
            return next(error) ; 
        }
        var foundAndseted=false
        var editCart=user.cart.map(obj=>{
            if(obj.product._id.toString()==ProductId.toString()){

                if(product.avilableNumber<obj.numberNeeded+Needed){
                    console.debug(product.avilableNumber,obj.numberNeeded+Needed)
                     const error = new Error('sorry you cant pay this amount right now');
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
            
            return res.status(200).json({state:1,msg:'the item added to the cart'})
           

        }
        else{
            console.debug("else run")
            if(Needed>product.avilableNumber){

                return res.status(422).json({state:0,msg:'sorry you can not pay this amount'})

            }

             user.cart.push({
                numberNeeded:Needed,
                product:ProductId,
         })

         await user.save()
         return res.status(200).json({state:1,msg:'the item added to the cart'})

      
        
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
                return res.status(200).json({state:1,msg:'item deleted'})

            }
        

          

          res.status(422).json({state:0,msg:'cant decrese this is item ,item not found in your cart'})
        
           
       
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
          return res.status(200).json({state:1,msg:'item deleted from carts'})

       
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
        .select('method')
        .select('emailVerfied')
        .select('lang')
        
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
        const {name,email,lang}=req.body

       var imageUrl 
       if( req.files[0]){
        imageUrl = req.files[0].filename;
       }
       
        //console.debug(req.files,req.file)
        var user=await CustomerUser.findById(req.userId)
        console.debug(user.methods)
        if(email&&user.methods!='local'){

            const error = new Error('you cant edit your email');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 

        }
        user.name=name||user.name
        user.email=email||user.email
        user.photo=imageUrl||user.photo
        user.lang=lang||user.lang
        if(email){
            user.emailVerfied=false
        }
        await user.save()
        
        
        

          res.status(200).json({state:1,msg:"user info updated",msg_arb:"لقد تم تعديل البينات بنجاح"})
        
           
       
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

        const {paymentMethod,cartPrice,finalPrice,descPerc,address}=req.body
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

            res.status(200).json({state:1,msg:'order created succesfuly'})

        }else if(paymentMethod=='elec'){

            const NewPayMent=new Payment({
                cuser:user._id,
                methodOfPay:'elec',
                totalMoney:cartPrice,
                finalPrice:finalPrice,
                status:1,
                descPerc:descPerc
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
        const userCount=await TrederUsers.findById(req.userId)
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
            obj.createdAtMS=ms
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

        const {paymentMethod,RequestId,finalPrice}=req.body
       
            const request=await Request.findById(RequestId)
            if(!request){
            const error = new Error('invalid request id');
            error.statusCode = 422 ;
            return next(error) ; 
            }
            if(request.RequestData.status!=1){
                const error = new Error('sorry you can not pay now wait till your request is accespted');
                error.statusCode = 422 ;
                return next(error) ; 
            }

            if(request.RequestData.payment){
                const error = new Error('you already payed for it');
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

           

            res.status(200).json({state:1,msg:'payment created succesfuly'})

        }else if(paymentMethod=='elec'){

            const NewPayMent=new Payment({
                cuser:req.userId,
                methodOfPay:'elec',
                totalMoney:cartPrice,
                finalPrice:finalPrice,
                status:1,
                descPerc:descPerc
            })
            await NewPayMent.save()
            const order=new Order({
                cuser:req.userId,
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


}