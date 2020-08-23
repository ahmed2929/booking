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
//const validatePhoneNumber = require('validate-phone-number-node-js');
//const nodemailerMailgun=require('../../../helpers/sendEmail');
const fs=require('fs');
const shopcatigory = require('../../models/shopcatigory');
const PromoCode=require('../../models/promocode');
const topView = require('../../models/topView');
const Request =require('../../models/Request')
const Isuues=require('../../models/isuues')
const FQ=require('../../models/f&q');
const { request } = require('express');
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
    const {name}=req.body;
    var newname=name.toLowerCase();
    const catigo = await Catigory.findOne({name:newname});
    if(catigo){
        const error = new Error('catigory already exist');
        error.statusCode = 404 ;
        return next( error) ;
    }
    
        const NewCat= new Catigory({
           name:newname
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
    const {title,details,price,CatigoryName,avilableNum}=req.body;

    if(!Number(price)){
        const error = new Error('invalid price');
        error.statusCode = 404 ;
        return next( error) ;
    }


    const imageUrl = req.files;
    const catigo = await Catigory.findOne({name:CatigoryName.toLowerCase()});
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
            details,
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
        const {title,details,price,CatigoryName,avilableNum}=req.body;
        
        if(!Number(price)){
            const error = new Error('invalid price');
            error.statusCode = 404 ;
            return next( error) ;
        }
    
    
        const imageUrl = req.files;
        const catigo = await Catigory.findOne({name:CatigoryName});
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
    
            const cato=await Catigory.findById(product.catigory)
            const catIndexinArray=cato.products.indexOf(catigo._id.toString())
               if (catIndexinArray > -1) {
                   cato.products.splice(catIndexinArray, 1);
                 }
               await cato.save()
    
               const catonew=await Catigory.findById(catigory.catigo._id)
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
        const {name}=req.body;
        var newname=name.toLowerCase();
        const catigo = await MarketCatigory.findOne({name:newname});
        if(catigo){
            const error = new Error('catigory already exist');
            error.statusCode = 404 ;
            return next( error) ;
        }
        
            const NewCat= new MarketCatigory({
               name:newname
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
        
        const errors = validationResult(req);
        console.debug(errors)
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
        const status=req.params.status;
        console.debug(status)
        var user 
       if(status=='customer'){
         user = await customer.find();
       }else if(status=='treder') {
         user = await treder.find();
       }

       else{
        var user = await customer.find();
        var tuser = await treder.find();
        user.concat(tuser)
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
        
            res.status(200).json({state:1,status:status,fUser})
    
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
        var {name}=req.body;
        name=name.toLowerCase();
        const imageUrl = req.files;
        console.debug(name)
        const service = await AvilableService.findOne({name:name});
       
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
                image:images[0]||''
        
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
            
                res.status(200).json({state:1,TotalNumOfUsers})
        
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
                const UserId=req.params.UserId
                const type=req.params.type
               // console.debug(type,UserId)
                if(type=="treder"){
                    console.debug('if run')
                    const user=await treder.findById(UserId.toString())
                    //console.debug(user)
                     .populate({ path: 'MyWonAds', select:'title details images _id'})
                     .populate({ path: 'cart'})
                    
                    .select('name')
                    .select('email')
                    .select('photo')
                    .select('status')
                    .select('emailVerfied')
                    .select('mobileVerfied')
                    .select('mobile')
                    .select('blocked')
                    .select('MyWonAds')
                    if(!user){
                        return res.status(404).json({state:0,msg:'user not found'})
                    }
                     return res.status(200).json({state:1,user:user})
                    
                }else if(type=="customer"){
                    const user=await customer.findById(UserId.toString())
                    //console.debug(user)
                     .populate({ path: 'pendingRequestTo' ,select:'RequestData.status _id'})
                    
                    .select('name')
                    .select('email')
                    .select('photo')
                    .select('status')
                    .select('emailVerfied')
                    .select('mobileVerfied')
                    .select('mobile')
                    .select('blocked')
                    .select('pendingRequestTo')
                    if(!user){
                        return res.status(404).json({state:0,msg:'user not found'})
                    }

                    return res.status(200).json({state:1,user:user})
                }
                    
                     return res.status(422).json({state:0,msg:'invalid Type'})
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
        totalProducts= await Product.find().countDocuments();
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
            NumOfProducts: totalProducts,
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
         NumOfItems: totalItems,
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
    
   
    
        const promos =await PromoCode.find()

        res.status(201).json({state:1,promos})

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
        const orderId=req.params.orderId
        if(orderId){
            const order =await Order.findById(orderId.toString())
            .populate({path:'Cuser',select:'name email photo phone status'})
            .populate({path:'Tuser',select:'name email photo phone status'})
            .populate({path:'payment' ,select:'-Cuser -Tuser -updatedAt'})
            .populate({path:'cart.product',select:'images title price desc'})
            .select('-updatedAt')

            if(!order){
               return res.status(404).json({state:0,msg:'order not found'})
            }
            return res.status(200).json({state:1,order})
        }
        const orders =await Order.find()
        .populate({path:'Cuser',select:'name email photo phone status'})
            .populate({path:'Tuser',select:'name email photo phone status'})
            //.populate({path:'payment'})
            .select('-cart -payment')
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
        
        const status=req.params.status
        
        console.debug(status)
          if(status){
            const request = await Request.find({
            
                "RequestData.status": status
              
           })
           .populate({path:'from',select:'name email mobile _id'})
           .populate({path:'to' ,select:'name email mobile _id'})
           .populate({path:'AD' ,select:'images star price _id'})

            return res.status(200).json({state:1,request:request})

          }else{

            const request = await Request.find({
              
           })
           .populate({path:'from',select:'name email mobile _id'})
           .populate({path:'to' ,select:'name email mobile _id'})
           .populate({path:'AD' ,select:'images star price _id'})

            return res.status(200).json({state:1,request:request})

            

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
        
       const {status,id}=req.query
       if(id){
           
        const isuue=await Isuues.findById(id)
        .populate({path:'Cuser',select:'name email _id photo blocked emailVerfied'})
        .populate({path:'Tuser',select:'name email _id photo blocked emailVerfied'})
        if(!isuue){
           return res.status(404).json({state:0,mgs:"isuue not found"})
        }
        return res.status(200).json({state:1,isuue})
    }else if(status){
        const isuues=await Isuues.find({
            status:status
        })
        .populate({path:'Cuser',select:'name email _id photo blocked emailVerfied'})
        .populate({path:'Tuser',select:'name email _id photo blocked emailVerfied'})
        
           return res.status(200).json({state:1,support:isuues})
        
    }else{
        const isuues=await Isuues.find()
        .populate({path:'Cuser',select:'name email _id photo blocked emailVerfied'})
        .populate({path:'Tuser',select:'name email _id photo blocked emailVerfied'})
        
           return res.status(200).json({state:1,support:isuues})

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

     const {id}=req.params

        if(id){
           const fq= await FQ.findById(id)
          return res.status(200).json({state:1,fq})
        }    
        const fqs= await FQ.find()
        return res.status(200).json({state:1,fqs})


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
    AnswerSupport
    



}