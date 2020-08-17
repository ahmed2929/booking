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
const { connected } = require('process');
const path=require('path')
//const validatePhoneNumber = require('validate-phone-number-node-js');
//const nodemailerMailgun=require('../../../helpers/sendEmail');
const fs=require('fs')
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
    const {title,details,price,CatigoryName}=req.body;

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
            images.push(image.path);
        
    });
    
    console.debug(images)
        const NewProduct= new Product({
            title,
            details,
            price,
            catigory:catigo._id,
            images:images
            
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
        const {title,details,price,CatigoryName}=req.body;
        
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
                images.push(image.path);
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
       }else{
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
    getTotalNumOfUsers



}