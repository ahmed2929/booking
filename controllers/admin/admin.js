const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const admin = require('../../models/admin');
const Catigory=require('../../models/shopcatigory');
const MarketCatigory=require('../../models/catigory') 
const Product=require('../../models/shopProducts')
const ADS=require('../../models/ADS')
const TopView=require('../../models/topView')
const customer=require('../../models/CustomerUser')
const treder=require('../../models/TrederUsers')
const AvilableService=require('../../models/AvilableServices')
const Order=require('../../models/order')
const { connected } = require('process');
const path=require('path')
const notificationSend=require('../../helpers/send-notfication').send
const notificationSendALL=require('../../helpers/send-notfication').sendAll


//const validatePhoneNumber = require('validate-phone-number-node-js');
//const nodemailerMailgun=require('../../../helpers/sendEmail');
const fs=require('fs');
const shopcatigory = require('../../models/shopcatigory');
const PromoCode=require('../../models/promocode');
const topView = require('../../models/topView');
const Request =require('../../models/Request')
const Isuues=require('../../models/isuues')
const FQ=require('../../models/f&q');
const Suggest =require('../../models/suggest')
const { request } = require('express');
const catigory = require('../../models/catigory');
const City=require('../../models/cities')
const WithDraw=require('../../models/withdraw');
const wallet = require('../../models/wallet');
const pagenation=require('../../helpers/general/helpingFunc').paginate

var register=async (req,res,next)=>{

    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const email     = req.body.email;
    const password  = req.body.password;

    const findEmailLocal=await admin.findOne({"email":email})
    

    if(findEmailLocal){
        const error = new Error('email alreay exist please try to login');
        error.statusCode = 422;
       return next(error) ;
    }

    bycript.hash(password,12).then(hashedPass=>{
        const newUser = new admin({
           
            
                email:email,
                password:hashedPass,
               
           
        });
        return newUser.save();
    })   
    .then(user=>{
        const token  = jwt.sign(
            {
                userId:user._id.toString()
            },
            process.env.JWT_PRIVATE_KEY
        );

       return res.status(201).json({state:1,message:'admin created',token});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    });



    }


var login=async(req,res,next)=>{

    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const {email,password}=req.body
        
       

             const user = await admin.findOne({'email':email}) 
            
                if(!user){
                    const error = new Error('user not found');
                    error.statusCode = 404 ;
                    return next(error) ;
                }    
                const isEqual = await bycript.compare(password,user.password);
                if(!isEqual){
                    const error = new Error('incorrect password');
                    error.statusCode = 401 ;
                    return next(error) ;
                }
                
                
                const token  = jwt.sign(
                    {
                        userId:user._id.toString()
                    },
                    process.env.JWT_PRIVATE_KEY
                );
    
               
    
                res.status(200).json({
                    state:1,
                    token:token,
                    admin:true
                   
                });
        }catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        }
        


}

var createProductCatigory=async(req,res,next)=>{
    
    try{
    
    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {name,arb_name}=req.body;
    var newname=name.toLowerCase();
    const catigo = await Catigory.findOne({name:newname,arb_name:arb_name});
    if(catigo){
        const error = new Error('catigory already exist');
        error.statusCode = 404 ;
        return next( error) ;
    }
    
        const NewCat= new Catigory({
           name:newname,
           arb_name
        })
        await NewCat.save(); 
        res.status(201).json({state:1,msg:'catigory created '})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
        
var editProductCatigory=async(req,res,next)=>{
    
    try{
    
    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    var {oldname,newname}=req.body;
     oldname=oldname.toLowerCase();
     newname=newname.toLowerCase();
     console.debug(oldname,newname)
    const catigo = await Catigory.findOne({name:oldname});
    if(!catigo){
        const error = new Error('catigory not found');
        error.statusCode = 404 ;
        return next( error) ;
    }

    catigo.name=newname
        await catigo.save(); 
        res.status(201).json({state:1,msg:'catigory uptated '})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

var deleteProductCatigory=async(req,res,next)=>{
    
    try{
    
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const {name}=req.body;
        var newname=name.toLowerCase();
        const catigo = await Catigory.findOneAndDelete({name:newname});
       
            res.status(201).json({state:1,msg:'catigory deleted '})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        

}

var CreateProduct=async (req,res,next)=>{
    try{
     
    


    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {title,details,price,CatigoryID,avilableNum}=req.body;

    if(!Number(price)){
        const error = new Error('invalid price');
        error.statusCode = 404 ;
        return next( error) ;
    }


    const imageUrl = req.files;
    var catigo ;
    catigo= await Catigory.findById(CatigoryID);
    
    if(!catigo){
            const error = new Error('catigory not Found');
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
            images.push(image.filename);
        
    });
    
    console.debug(images)
        const NewProduct= new Product({
            title,
            desc:details,
            price,
            catigory:catigo._id,
            images:images,
            avilableNumber:avilableNum
            
        })
        await NewProduct.save();
        
            catigo.products.push(NewProduct._id)
            await catigo.save()
            res.status(200).json({state:1,message:'product created Sucessfully'});
        
        

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    


    }
  

    var editProduct= async (req,res,next)=>{
        try{
            const AdId=req.body.productID
           // console.debug(AdId)
            const product=await Product.findById(AdId)
            if(!product){
            const error = new Error('No product found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
            //console.debug('creator',AD.Creator,'user',req.userId)
            //console.debug(AD.Creator.toString() !=req.userId.toString())
    
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const {title,details,price,CatigoryID,avilableNum}=req.body;
        
        if(!Number(price)){
            const error = new Error('invalid price');
            error.statusCode = 404 ;
            return next( error) ;
        }
    
    
        const imageUrl = req.files;
        var catigo 
        catigo= await Catigory.findById(CatigoryID)
        console.debug(catigo)
        if(!catigo){
            const error = new Error('catigory not found');
            error.statusCode = 404 ;
            return next( error) ;
            
            
        }
        let images = [];
    
        if(imageUrl.length!=0){
    
            product.images.forEach((i) => {
                console.debug(i)
              fs.unlink(path.join(i),(err)=>{
               console.debug(err)
              });
    
              product.images=[]
            imageUrl.forEach(image=>{
                images.push(image.filename);
            })
                
        });   
        } else{
            images=product.images
        }
    
    
        if(product.catigory.toString()!=catigo._id.toString()){
            
            var oldCat=await Catigory.findById(product.catigory.toString())
            var oldArrayIndex=oldCat.products.indexOf(AdId)
            if(oldArrayIndex>-1){
                oldCat.products.splice(oldArrayIndex,1)
            }
            await oldCat.save()
    
               var catonew=await Catigory.findById(CatigoryID)
               catonew.products.push(product._id)
                  await catonew.save()
    
                }
    
    
        
    
    
    
             
        
                product.catigory=catigo._id
                product.price=price
                product.images=images
                product.details=details
                product.title=title
                product.avilableNumber=avilableNum
        
            
            await product.save();
                res.status(200).json({state:1,message:'product uptated Sucessfully'});
            
            
    
    
    
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
    
            const productID =req.body.produtId
            const product=await Product.findById(productID)
            if(!product){
            const error = new Error('No product found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
        
            
           // console.debug(AD)
            console.debug(product)
        const catigory=await Catigory.findById(product.catigory)
        console.debug(catigory)
        const catigoryIndex=await catigory.products.indexOf(productID.toString())
        if (catigoryIndex > -1) {
            console.debug('index',catigoryIndex,'array',catigory.products)
            catigory.products.splice(catigoryIndex, 1);
          }
          console.debug( 'catigory array',catigory.ads)
          await catigory.save()
         await Product.findByIdAndDelete(productID);
    
    
          product.images.forEach((i) => {
             console.debug(i)
           fs.unlink(path.join(i),(err)=>{
            console.debug(err)
           });
      
      });
    
    
         res.status(200).json({state:1,message:'product deleted Sucessfully'});
    
    
    
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
    
    }

    var setTopView=async (req,res,next)=>{
        try{
            const errors = validationResult(req);
                console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
    
            const {adId,position} =req.body
            const ad=await ADS.findById(adId)
            if(!ad){
            const error = new Error('No ad found !!');
            error.statusCode = 404 ;
            return next( error) ;
    
            }
            var itemExist=await TopView.findOne({ad:ad._id})
            if(itemExist){
                itemExist.position=position
        
                await itemExist.save()
                return res.status(200).json({state:1,message:'product added to top view suceesfuly'});

            }
            
            const topview=new TopView({
                ad:{
                    _id:ad._id
                },
                position:position
            })
            await topview.save()
           // console.debug(AD)
    
            
    
    
         res.status(200).json({state:1,message:'product added to top view suceesfuly'});
    
    
    
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
    
    }
     var deleteFromTopView=async (req,res,next)=>{
        try{
            const errors = validationResult(req);
                console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
    
            const {adId} =req.body
           await topView.findByIdAndDelete(adId)
    
    
         res.status(200).json({state:1,message:'ad deleted from top view'});
    
    
    
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        
    
    }
     }
    var createApprtmentCatigory=async(req,res,next)=>{

        try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const {name,arb_name}=req.body;
        var newname=name.toLowerCase();
        var catigo 
        catigo= await MarketCatigory.findOne({name:newname,arb_name});
        if(catigo){
            const error = new Error('catigory already exist');
            error.statusCode = 404 ;
            return next( error) ;
        }
    
            const NewCat= new MarketCatigory({
               name:newname,
               arb_name
            })
            await NewCat.save(); 
            res.status(201).json({state:1,msg:'catigory created '})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        
    
    }

    var EditApprtmentCatigory=async(req,res,next)=>{

        try{
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const {name,arb_name,CatId}=req.body;
        var newname=name.toLowerCase();
        var catigo 
        catigo= await MarketCatigory.findById(CatId);
        if(!catigo){
            const error = new Error('catigory not found');
            error.statusCode = 404 ;
            return next( error) ;
        }
    
           
        catigo.name=newname||catigo.name
        catigo.arb_name=arb_name|| catigo.arb_name
          
            await catigo.save(); 
            res.status(200).json({state:1,msg:'catigory updated '})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        
    
    }
        
     var blockCustomerUser=async(req,res,next)=>{

    
        try{
        
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const {userId,block,status}=req.body;
        var user 
       if(status=='customer'){
         user = await customer.findById(userId);
       }else if(status=='treder'){
         user = await treder.findById(userId);
       }
        
        if(!user){
            const error = new Error('user not found');
            error.statusCode = 404 ;
            return next( error) ;
        }
        
            user.blocked=block
            await user.save(); 
            res.status(201).json({state:1,msg:'user status changed'})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        
    
    }

    var getAllUsers=async(req,res,next)=>{
        try{
            const page = req.query.page *1 || 1;
            const itemPerPage = 10;
            var TotalNumOfUsers
     
       
        var status=req.params.status;
        console.debug(status)
        var user 
       if(status=='customer'){
        TotalNumOfUsers = await customer.find().countDocuments()
         user = await customer.find()
         .skip((page - 1) * itemPerPage)
         .limit(itemPerPage)
       }else if(status=='treder') {
        TotalNumOfUsers = await treder.find().countDocuments()
         user = await treder.find()
         .skip((page - 1) * itemPerPage)
         .limit(itemPerPage)
       }

       else{
        TotalNumOfUsers = await customer.find().countDocuments()
        TotalNumOfUsers += await treder.find().countDocuments()
        status='all'
         user = await customer.find()
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        var tuser = await treder.find()
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        user=user.concat(tuser)
       // user=pagenation(user,itemPerPage,page)
        //console.debug(user,page,itemPerPage)
       }
        
        if(!user){
            const error = new Error('user not found');
            error.statusCode = 404 ;
            return next( error) ;
        }
        const fUser=user.map(obj=>{
            return {
                name:obj.name,
                email:obj.email,
                Id:obj._id
            }
        })
        
            res.status(200).json({state:1,status:status,fUser,TotaNum:TotalNumOfUsers})
    
        }catch(err){
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        
    
    }

    var createService=async (req,res,next)=>{
        
        try{
            console.debug('controller runas')
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        var {name,arb_name}=req.body;
        name=name.toLowerCase();
        const imageUrl = req.files;
        console.debug(name)
        const service = await AvilableService.findOne({name:name,arb_name:arb_name});
       
        if(service){
            const error = new Error('service already exist');
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
            
                images.push(image.filename);
            
        });
        
            const Newservice= new AvilableService({
                name:name,
                image:images[0]||'',
                arb_name
        
            })
            await Newservice.save();
                
                res.status(200).json({state:1,message:'service created Sucessfully'});
            
            
    
        }catch(err){
            
            console.debug(err)
                if(!err.statusCode){
                    err.statusCode = 500; 
                }
                return next(err);
        }
        
    
    
        }

        var EditService=async (req,res,next)=>{
        
            try{
                console.debug('controller runas')
            const errors = validationResult(req);
            console.debug(errors)
            if(!errors.isEmpty()){
                const error = new Error('validation faild');
                error.statusCode = 422 ;
                error.data = errors.array();
                return next(error) ; 
            }
            var {name,arb_name,ServiceId}=req.body;
            name=name.toLowerCase();
            const imageUrl = req.files;
            console.debug(name)
            const service = await AvilableService.findById(ServiceId);
           
            if(!service){
                const error = new Error('service not found');
                error.statusCode = 404 ;
                return next( error) ;
            }
            let images = [];
        
        
            imageUrl.forEach(image=>{
                
                    images.push(image.filename);
                
            });
            
                service.name=name||service.name
                service.image=images[0]||service.image
                service.arb_name=arb_name||service.arb_name
                await service.save();
                    
                    res.status(200).json({state:1,message:'service updated Sucessfully'});
                
                
        
            }catch(err){
                
                console.debug(err)
                    if(!err.statusCode){
                        err.statusCode = 500; 
                    }
                    return next(err);
            }
            
        
        
            }
        

        var getTotalNumOfUsers=async(req,res,next)=>{

    
            try{
            var TotalNumOfUsers
            const errors = validationResult(req);
            console.debug(errors)
            if(!errors.isEmpty()){
                const error = new Error('validation faild');
                error.statusCode = 422 ;
                error.data = errors.array();
                return next(error) ; 
            }
            const status=req.params.status;
          var custNum=user = await customer.find()
          .countDocuments()
            var tNum= user = await treder.find()
            .countDocuments()
             
           if(status=='customer'){
            TotalNumOfUsers=custNum

           }else if(status=='treder') {
            TotalNumOfUsers=tNum
           }else{
            TotalNumOfUsers=tNum+custNum
    
           }
            
                res.status(200).json({state:1,TotaNum:TotalNumOfUsers})
        
            }catch(err){
                console.debug(err)
                    if(!err.statusCode){
                        err.statusCode = 500; 
                    }
                    return next(err);
            }
            
        
        }

        const getuserProfile=async(req,res,next)=>{
            console.debug('controller run')
            try{
                const page = req.query.page *1 || 1;
                const itemPerPage = 10; 
                const UserId=req.params.UserId
                const type=req.params.type
               // console.debug(type,UserId)
               const Tuser=await treder.findById(UserId.toString())
                
                if(Tuser){
                    console.debug('if run')
                    var AdsLen=Tuser.MyWonAds.length
                    const user=await treder.findById(UserId.toString())
                    //console.debug(user)
                     .populate({ path: 'MyWonAds', select:'title details images _id'})

                     .populate([
                        // here array is for our memory. 
                        // because may need to populate multiple things
                        {
                            path: 'MyWonAds',
                            select: 'title details images _id',
                            
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

                    .populate({ path: 'Orders',populate:'payment'} )
                    
                    .select('name')
                    .select('email')
                    .select('photo')
                    .select('status')
                    .select('emailVerfied')
                    .select('mobileVerfied')
                    .select('mobile')
                    .select('blocked')
                    .select('MyWonAds')
                    .select('Orders')
                    if(!user){
                        return res.status(404).json({state:0,msg:'user not found'})
                    }
                     return res.status(200).json({state:1,user:user,AdsLen})
                    
                }else{
                    const user=await customer.findById(UserId.toString())
                    //console.debug(user)
                     //.populate({ path: 'pendingRequestTo' ,select:'RequestData.status _id'})
                     .populate({ path: 'Orders',populate:'payment'} )
                    .select('name')
                    .select('email')
                    .select('photo')
                    .select('status')
                    .select('emailVerfied')
                    .select('mobileVerfied')
                    .select('mobile')
                    .select('blocked')
                    .select('Orders')
                    if(!user){
                        return res.status(404).json({state:0,msg:'user not found'})
                    }

                    return res.status(200).json({state:1,user:user})
                }
                    
                     
                }
                catch(err){
                    console.debug(err)
                    if(!err.statusCode){
                        err.statusCode = 500;
                    }
                    return next(err);
                
        }
        }

 const getAllProducts=async(req,res,next)=>{

 try{
    const page = req.query.page || 1;
    const productPerPage = 10;
    const filter = req.query.filter 
    const optinalSearchParam=req.query.SearchBy
    console.debug(filter,optinalSearchParam)
    let totalProducts;
    let products;
    if (filter == 'sold') {
        totalProducts= await Product.find({sold: {$gte: 0}}).countDocuments();
        products = await Product.find({sold: {$gte: 0}})
        .populate({path:'catigory' ,select:'name'})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({'sold':'-1'})
    } else if (filter == 'catigory') {
        const cato=await Catigory.findOne({name:optinalSearchParam})
        if(!cato){
            res.status(404).json({
                state: 0,
                msg: 'catigory not found',
                
              });
        }
        totalProducts= await Product.find({catigory:cato._id}).countDocuments();
        products = await Product.find({catigory:cato._id})
        .populate({path:'catigory' ,select:'name'})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({'sold':'-1'})
        console.debug(products)
    }else if (filter == 'price') {
        totalProducts= await Product.find().countDocuments();
        var sortVal=1
        if(optinalSearchParam=='top'){
            console.debug('top run')
            sortVal=-1
        }
        products = await Product.find()
        .populate({path:'catigory' ,select:'name'})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({'price':sortVal})
    }else if(filter=='outOfStock'){
        totalProducts= await Product.find({avilableNumber: {$lte: 0}}).countDocuments();
        var sortVal=1
        products = await Product.find({avilableNumber: {$lte: 0}})
        .populate({path:'catigory' ,select:'name'})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({'price':sortVal})
    }


    if(!filter){
        totalProducts= await Product.find().countDocuments()
        products = await Product.find()
        .populate({path:'catigory' ,select:'name'})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({'sold':`-1`})


       return res.status(200).json({
            state: 1,
            TotaNum: totalProducts,
            products: products,
          });
    }
    res.status(200).json({
      state: 1,
      NumOfProducts: totalProducts,
      products: products,
    });
             
            }catch(err){
                console.debug(err)
                    if(!err.statusCode){
                        err.statusCode = 500; 
                    }
                    return next(err);
            }
            
        
        }

const TotalNum=async(req,res,next)=>{
try{
    var TotalNum;
    var DataObj=[]
    const status=req.params.status;
    switch (status) {
        case 'customer':
            TotalNum=await customer.find()
            .countDocuments()
            break;
            case 'treder':
            TotalNum= await treder.find()
            .countDocuments()
            break;
            case 'users':
            var tuser=user = await treder.find()
            .countDocuments()
            var cuser=user = await customer.find()
            .countDocuments()
            TotalNum=tuser+cuser
            break;
            case 'products':
                TotalNum= await Product.find()
                .countDocuments()
                break;
            case 'ads':
                 TotalNum= await ADS.find()
                    .countDocuments()
                    break;
            case 'shopCatigory':
                var shopCat= await shopcatigory.find()
                shopCat.forEach(obj=>{
                    console.debug(obj)
                    DataObj.push({
                        catoName:obj.name,
                        numOfProduct:obj.products.length

                    })
                })
                     break;

                     case 'MarketCatigory':
                        var shopCat= await MarketCatigory.find()
                        shopCat.forEach(obj=>{
                            console.debug(obj)
                            DataObj.push({
                                catoName:obj.name,
                                numOfProduct:obj.ads.length
        
                            })
                        })
                             break;
                
    
        default:
           return res.status(404).json({state:0,msg:'invalid param'})
           
    }
    
    if(DataObj.length>0){
       return res.status(200).json({state:1,Data:DataObj})
    }
    
        res.status(200).json({state:1,TotalNum})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

    
        const getAllAds=async(req,res,next)=>{

    
            try{
            
            const errors = validationResult(req);
            console.debug(errors)
            if(!errors.isEmpty()){
                const error = new Error('validation faild');
                error.statusCode = 422 ;
                error.data = errors.array();
                return next(error) ; 
            }
            const id=req.params.id;
            if(id){
                const ad =await ADS.findById(id)
                if(!ad){
                    const error = new Error('user not found');
                error.statusCode = 404 ;
                return next( error) ;
                }


               return res.status(200).json({state:1,ad:ad})



            }

            const ads =await ADS.find()
           return res.status(200).json({state:1,ads:ads})

             
            }catch(err){
                console.debug(err)
                    if(!err.statusCode){
                        err.statusCode = 500; 
                    }
                    return next(err);
            }
            
        
        }

        const getAllshopOrders=async(req,res,next)=>{

    
            try{
            
            const errors = validationResult(req);
            console.debug(errors)
            if(!errors.isEmpty()){
                const error = new Error('validation faild');
                error.statusCode = 422 ;
                error.data = errors.array();
                return next(error) ; 
            }
            const id=req.params.id;
            if(id){
                const order =await Order.findById(id)
                if(!order){
                    const error = new Error('order not found');
                error.statusCode = 404 ;
                return next( error) ;
                }


               return res.status(200).json({state:1,order:order})



            }

            const orders =await Order.find()
           return res.status(200).json({state:1,orders:orders})

             
            }catch(err){
                console.debug(err)
                    if(!err.statusCode){
                        err.statusCode = 500; 
                    }
                    return next(err);
            }
            
        
        }
const getItemsByCatigory=async(req,res,next)=>{

    try{
       const page = req.query.page || 1;
       const productPerPage = 10;
       const type = req.query.type 
       const optinalSearchParam=req.query.catigory
     
       let totalItems;
       let Items;
        if (type == 'products') {
           const cato=await Catigory.findOne({name:optinalSearchParam})
           if(!cato){
               res.status(404).json({
                   state: 0,
                   msg: 'catigory not found',
                   
                 });
           }
           totalItems= await Product.find({catigory:cato._id}).countDocuments();
           Items = await Product.find({catigory:cato._id})
           .populate({path:'catigory' ,select:'name'})
           .skip((page - 1) * productPerPage)
           .limit(productPerPage)
           .sort({'sold':'-1'})
       }else if (type == 'ads') {
        const cato=await MarketCatigory.findOne({name:optinalSearchParam})
        if(!cato){
            res.status(404).json({
                state: 0,
                msg: 'catigory not found',
                
              });
        }
        totalItems= await ADS.find({catigory:cato._id}).countDocuments();
        Items = await ADS.find({catigory:cato._id})
        .populate({path:'catigory' ,select:'name'})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({'star':'-1'})
       // console.debug(Items)
       }
   
   
       if(!type){
          return res.status(404).json({
               state: 0,
              msg:'invalid type'
             });
       }
       res.status(200).json({
         state: 1,
         TotaNum: totalItems,
         items: Items,
       });
                
               }catch(err){
                   console.debug(err)
                       if(!err.statusCode){
                           err.statusCode = 500; 
                       }
                       return next(err);
               }
}   

const createPromo=async(req,res,next)=>{

    
    try{
    
    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {name,descPercent}=req.body;
    
        const NewPromo= new PromoCode({
           name,
           descPercent
        })
        await NewPromo.save(); 
        res.status(201).json({state:1,msg:'promo created '})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const editPromo=async(req,res,next)=>{

    
    try{
    
    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {name,descPercent,PromoId}=req.body;

    const promo=await PromoCode.findById(PromoId)
    promo.name=name
    promo.descPercent=descPercent

        await promo.save(); 
        res.status(200).json({state:1,msg:'promo edited '})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const deletePromo=async(req,res,next)=>{

    
    try{
    
    const errors = validationResult(req);
    console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const {PromoId}=req.body;

    await PromoCode.findByIdAndDelete(PromoId)
    
        res.status(200).json({state:1,msg:'promo deleted '})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const getAllPromo=async(req,res,next)=>{

    
    try{
        const page = req.query.page || 1;
        const productPerPage = 10;
   
        const TotalNum =await PromoCode.find().countDocuments()
        const promos =await PromoCode.find()
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)

        res.status(200).json({state:1,promos,TotaNum:TotalNum})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

const getOrders=async(req,res,next)=>{

    
    try{
        const page = req.query.page || 1;
        const productPerPage = 10;
        const orderId=req.params.orderId
        if(orderId){
            const order =await Order.findById(orderId.toString())
            .populate({path:'Cuser',select:'name email photo phone status'})
            .populate({path:'Tuser',select:'name email photo phone status'})
            .populate({path:'payment' ,select:'-Cuser -Tuser -updatedAt'})
            .populate({path:'cart.product',select:'images title price desc'})
            .populate('address')
        
            
            
            .select('-updatedAt')

            if(!order){
               return res.status(404).json({state:0,msg:'order not found'})
            }
            return res.status(200).json({state:1,order})
        }
        const totalProducts= await Product.find().countDocuments()
        const orders =await Order.find()

        .populate({path:'Cuser',select:'name email photo phone status'})
            .populate({path:'Tuser',select:'name email photo phone status'})
            //.populate({path:'payment'})
            .select('-cart -payment')
            .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        res.status(200).json({state:1,orders})

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

const getBookingOpertaions=async(req,res,next)=>{
    try{

        const page = req.query.page || 1;
        const productPerPage = 10;
        
        const status=req.params.status
        const id=req.params.id
        if(id){
            const order =await Request.findById(id.toString())
            .populate({path:'from',select:'name email mobile _id'})
            .populate({path:'to' ,select:'name email mobile _id'})
            .populate({path:'AD' ,select:'images star price _id'})

            if(!order){
               return res.status(404).json({state:0,msg:'operation not found'})
            }
            return res.status(200).json({state:1,operation:order})
        }
        console.debug(status)
          if(status){
              const TotalNum=await Request.find({
            
                "RequestData.status": status
              
           }).countDocuments()
            const request = await Request.find({
            
                "RequestData.status": status
              
           })
           .populate({path:'from',select:'name email mobile _id'})
           .populate({path:'to' ,select:'name email mobile _id'})
           .populate({path:'AD' ,select:'images star price _id'})
           .skip((page - 1) * productPerPage)
           .limit(productPerPage)
            return res.status(200).json({state:1,request:request,TotalNum})

          }else{

            const TotalNum=await Request.find({
            
                
              
           }).countDocuments()

            const request = await Request.find({
              
           })
           .populate({path:'from',select:'name email mobile _id'})
           .populate({path:'to' ,select:'name email mobile _id'})
           .populate({path:'AD' ,select:'images star price _id'})
           .skip((page - 1) * productPerPage)
           .limit(productPerPage)

            return res.status(200).json({state:1,request:request,TotalNum})

            

          }
       



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

const getSupportMessagesFromUsers=async(req,res,next)=>{
    try{
        const itemPerPage=10
       const {status,id,page}=req.query
       if(id){
           
        const isuue=await Isuues.findById(id)
        .populate({path:'Cuser',select:'name email _id photo blocked emailVerfied status'})
        .populate({path:'Tuser',select:'name email _id photo blocked emailVerfied status'})
        if(!isuue){
           return res.status(404).json({state:0,mgs:"isuue not found"})
        }

    
            var newObj={
                user:isuue.Cuser||isuue.Tuser,
                message:isuue.message,
                createdAt:isuue.createdAt,
                ID:isuue._id,
                answer:isuue.answer,
                status:isuue.status
            
            }
        


        return res.status(200).json({state:1,isuue:newObj})
    }else if(status){
        const isuuesNum=await Isuues.find({
            status:status
        }).countDocuments()
        const isuues=await Isuues.find({
            status:status
        })
        .populate({path:'Cuser',select:'name email _id photo blocked emailVerfied status'})
        .populate({path:'Tuser',select:'name email _id photo blocked emailVerfied status'})
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        
        var Fresult=isuues.map(oldObj=>{
            var newObj={
                user:oldObj.Cuser||oldObj.Tuser,
                message:oldObj.message,
                createdAt:oldObj.createdAt,
                ID:oldObj._id,
                answer:oldObj.answer,
                status:oldObj.status
            
            }
            return newObj
        })

           return res.status(200).json({state:1,support:Fresult,isuuesNum})
        
    }else{
        const isuuesNum=await Isuues.find({
        }).countDocuments()
        const isuues=await Isuues.find()
        .populate({path:'Cuser',select:'name email _id photo blocked emailVerfied status'})
        .populate({path:'Tuser',select:'name email _id photo blocked emailVerfied status'})
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)

        var Fresult=isuues.map(oldObj=>{
            var newObj={
                user:oldObj.Cuser||oldObj.Tuser,
                message:oldObj.message,
                createdAt:oldObj.createdAt,
                ID:oldObj._id,
                answer:oldObj.answer,
                status:oldObj.status
            
            }
            return newObj
        })

           return res.status(200).json({state:1,support:Fresult,TotaNum:isuuesNum})

    }

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const AnswerSupport=async(req,res,next)=>{
    try{
        
       const {id,answer}=req.body
       
        var isuue=await Isuues.findById(id)
       
        if(!isuue){
           return res.status(404).json({state:0,mgs:"isuue not found"})
        }
        
        isuue.answer=answer
        isuue.status=1
        await isuue.save()
        return res.status(200).json({state:1,mgs:"isuue saved"})
        

    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const createFQ=async(req,res,next)=>{
    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {question,answer}=req.body
        const newfq =new FQ({
            question,
            answer
        })
       await newfq.save()
        
        res.status(200).json({state:1,msg:"FQ created"})



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const editFQ=async(req,res,next)=>{
    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {FQID,question,answer}=req.body
       await FQ.findByIdAndUpdate(FQID,{
        question,
        answer
       })
       
        
        res.status(200).json({state:1,msg:'FQ updated'})



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const deleteFQ=async(req,res,next)=>{
    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {FQID}=req.body
       await FQ.findByIdAndDelete(FQID)
       
        
        res.status(200).json({state:1,msg:'FQ deleted'})



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const getFQ=async(req,res,next)=>{
    try{
        const page=req.query.page
        const itemPerPage=10
     const {id}=req.params

        if(id){
           const fq= await FQ.findById(id)
          return res.status(200).json({state:1,fq})
        }    
        const TotalNumfqs= await FQ.find().countDocuments()
        const fqs= await FQ.find()
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)

        return res.status(200).json({state:1,fqs,TotaNum:TotalNumfqs})


    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const AddCity=async(req,res,next)=>{
    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {name,arb_name}=req.body
        const newcity=new City({
            name,
            arb_name
        })
       await newcity.save()
        
        res.status(200).json({state:1,msg:"newcity created"})



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}
const deleteCity=async(req,res,next)=>{
    try{

        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }

        const {cityId}=req.body
       await City.findByIdAndDelete(cityId)
     
        
        res.status(200).json({state:1,msg:"city delted"})



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
        const {id}=req.params
        console.debug('id',id)
       if(id){
        const result =await Suggest.findById(id)
        .populate({path:'Cuser Tuser ',select:'name photo status '})
        .lean()

             var newObj={
                 user:result.Cuser||result.Tuser,
                 suggest:result.suggest,
                 createdAt:result.createdAt,
                 ID:result._id
             }
           
       
       return res.status(200).json({state:1,result:newObj})

       }
       const result =await Suggest.find()
       .populate({path:'Cuser Tuser ',select:'name photo status '})

       var Fresult=result.map(oldObj=>{
        var newObj={
            user:oldObj.Cuser||oldObj.Tuser,
            suggest:oldObj.suggest,
            createdAt:oldObj.createdAt,
            ID:oldObj._id
        }
        return newObj
    })
   return res.status(200).json({state:1,result:Fresult})


       
       



    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}


const getAllWithDarwRequests=async(req,res,next)=>{
    try{
        const page=req.query.page
        const itemPerPage=10
       const TotalNum= await WithDraw.find().countDocuments()
       const withDraw=await WithDraw.find()
       .skip((page - 1) * itemPerPage)
       .limit(itemPerPage)
       .sort('-1')
       
       res.status(200).json({state:1,result:withDraw,TotalNum}) 
       
       
      
       


    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

const ChangWithDrawStatus=async(req,res,next)=>{
    try{
       
       var {status,WithDrawId}=req.body
        const withdraw=await WithDraw.findById(WithDrawId.toString())
        .populate('user')
        if(!withdraw){
            const error = new Error('withdraw not found');
            error.statusCode = 422 ;
            return next(error)
        }
        console.debug(withdraw)
        if(withdraw.RequestStatus==2){
            const error = new Error('withdraw can not be edit');
            error.statusCode = 422 ;
            return next(error)
        }
        if(withdraw.RequestStatus==1&&status==0){
            const error = new Error('can not ignore request after accepting');
            error.statusCode = 422 ;
            return next(error)
        }
        withdraw.RequestStatus=status
        
        await withdraw.save()

        if(status==2){
            var editTwallet=await wallet.findOne({
                user:withdraw.user
            })
            if(!editTwallet){
                const error = new Error('wallet not found ');
            error.statusCode = 500 ;
            return next(error)
            }
            editTwallet.TotalPrice-=withdraw.RequiredWithdrowMoney
            await editTwallet.save()
            
        }

        const data={
     
        }
       var  notification={
            title:'withdraw state changed',
            body:`check out your wallet`
        }
       
            if(withdraw.user.lang==1){
                notification={
                    title:'لقد حدث تغير في حالة السحب ',
                    body:` تفقد حسابك`
                }
            }
    
    
         await notificationSend("NewRate",data,notification,withdraw.user._id,1)
            
         var Emassage=`
          <h4>
          withdraw state changed check out your wallet
          
          </h4>
         
         `
         if(withdraw.user.lang==1){
            Emassage=`
            <h4>
            لقد حدث تغير في حالة السحب 
            تفقد حسابك

            
            </h4>
           
           `
        }
         
         await sendEmail(withdraw.user.email,'NewRate',Emassage)
    
    
       res.status(200).json({state:1,result:'withdraw changed'}) 
       
       
      
       


    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

var sendNotifcationToMobile=async (req,res,next)=>{
    try{
        const errors = validationResult(req);
            console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }

        const {userId,type,msg,title} =req.body
        if(!type){
            const error = new Error('type is required');
            error.statusCode = 422 ;
            return next(error)
        }
        const data={
            
        }
 
 
        var notification={
            title,
            body:`${msg}`
        }
        
        
        if(type=='single'){
            if(!userId){
                const error = new Error('invalid user id');
            error.statusCode = 422 ;
            return next(error)
            }
            var user
            var Tuser=await treder.findById(userId)
            if(!Tuser){
                var Cuser=await Cuser.findById(userId)
                if(!Cuser){
                    const error = new Error('user is not found');
                    error.statusCode = 422 ;
                    return next(error)   
                }
                await notificationSend("massage form admin",data,notification,Cuser._id,0)
                return res.status(200).json({state:1,message:'notfication sent'});

                
              
            }
            await notificationSend("massage form admin",data,notification,Tuser._id,1)
            return res.status(200).json({state:1,message:'notfication sent'});

        }else if(type=='Treader'){

            await notificationSendALL("massage form admin",data,notification,1)
            
            return res.status(200).json({state:1,message:'notfication sent'});


        }else if(type=='Customer'){
            console.debug('customer run')
            await notificationSendALL("massage form admin",data,notification,0)
            
            return res.status(200).json({state:1,message:'notfication sent'});

        }
        


     res.status(422).json({state:0,message:'invalid type'});




    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }

}

const getAdRequest=async(req,res,next)=>{
    try{
        const page=req.query.page
        const itemPerPage=10
     const {id}=req.params

        if(id){
           const ad= await ADS.findById(id)
          return res.status(200).json({state:1,ad})
        }    
        const TotalNumfqs= await ADS.find({
            Accespted:false
        }).countDocuments()
        const fqs= await ADS.find({
            Accespted:false
        })
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)

        return res.status(200).json({state:1,ads:fqs,TotaNum:TotalNumfqs})


    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}

const AcceptAdRequest=async(req,res,next)=>{
    try{
        const page=req.query.page
        const itemPerPage=10
     const {id}=req.params

     if(!id){
        const error = new Error('id is require');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
     }  

       
           const ad= await ADS.findById(id)
          if(!ad){
            const error = new Error('ad not found');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
          }
          ad.Accespted=true
          await ad.save()
         
          const data={
            
        }
 
 
        var notification={
            title:'your ad is accepted',
            body:`${ad.title} is accepted`
        }
        await notificationSend("adRequest is accepted",data,notification,ad.Creator,1)


        return res.status(200).json({state:1,message:'ad accepted'})


    }catch(err){
        console.debug(err)
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            return next(err);
    }
    

}


module.exports={
    register,
    login,
    createProductCatigory,
    editProductCatigory,
    deleteProductCatigory,
    CreateProduct,
    editProduct,
    deleteById,
    setTopView,
    createApprtmentCatigory,
    blockCustomerUser,
    getAllUsers,
    createService,
    getTotalNumOfUsers,
    getuserProfile,
    getAllProducts,
    TotalNum,
    getItemsByCatigory,
    createPromo,
    editPromo,
    deletePromo
    ,getAllPromo,
    getOrders,
    deleteFromTopView,
    getBookingOpertaions,
    createFQ,
    editFQ,
    deleteFQ,
    getFQ,
    getSupportMessagesFromUsers,
    AnswerSupport,
    EditApprtmentCatigory,
    EditService,
    deleteCity,
    AddCity,
    suggest,
    ChangWithDrawStatus,
    getAllWithDarwRequests,
    sendNotifcationToMobile,
    getAdRequest,
    AcceptAdRequest
    



}