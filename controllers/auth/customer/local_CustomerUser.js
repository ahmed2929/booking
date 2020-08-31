const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const CustomerUser = require('../../../models/CustomerUser');
const validatePhoneNumber = require('validate-phone-number-node-js');
const nodemailerMailgun=require('../../../helpers/sendEmail');
const sendEmail=require('../../../helpers/sendEmail').sendEmail
var register=async (req,res,next)=>{

    const errors = validationResult(req);
   // console.debug(errors)
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const email     = req.body.email;
    const password  = req.body.password;
    const name      = req.body.name;
    const mobile    = req.body.mobile;
    const validMobile    = validatePhoneNumber.validate(mobile); 

    const findEmailLocal=await CustomerUser.findOne({"local.email":email})
    const findEmailgoogle=await CustomerUser.findOne({"google.email":email})
    const findEmailfacebook=await CustomerUser.findOne({"facebook.email":email})

    if(findEmailLocal||findEmailfacebook||findEmailgoogle){
        const error = new Error('email alreay exist please try to login with  ');
        error.statusCode = 422;
       return next(error) ;
    }

    if(!validMobile){
        const error = new Error('invalid mobile number!!');
        error.statusCode = 422;
       return next(error) ;
    }
    bycript.hash(password,12).then(hashedPass=>{
        const newUser = new CustomerUser({
            methods:'local',
            local:{
                email:email,
                password:hashedPass,
               
            },
           mobile:mobile,
           email:email,
           name:name,
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

       return res.status(201).json({state:1,message:'user created',userId:user._id});
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
        const {email,password,FCM}=req.body
        
        const usergoogle = await CustomerUser.findOne({'google.email':email}) 
        if(usergoogle){
            const error = new Error('please try to login with your google acount');
            error.statusCode = 401 ;
            return next(error) ;
        }
        const userfacebook = await CustomerUser.findOne({'facebook.email':email}) 

        if(userfacebook){
            const error = new Error('please try to login with your facebook acount');
            error.statusCode = 401 ;
            return next(error) ;
        }


             const user = await CustomerUser.findOne({'local.email':email}) 
            
                if(!user){
                    const error = new Error('user not found');
                    error.statusCode = 404 ;
                    return next(error) ;
                }    
                const isEqual = await bycript.compare(password,user.local.password);
                if(!isEqual){
                    const error = new Error('incorrect password');
                    error.statusCode = 401 ;
                    return next(error) ;
                }
                if(user.blocked==true){
                    const error = new Error('you are blocked from using the app');
                    error.statusCode = 403 ;
                    return next(error) ;
                }
                const index =  user.FCMJwt.indexOf(FCM);
                if(index==-1){
                    user.FCMJwt.push(FCM);
                    await user.save();
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
                    name:user.name,
                    email:user.email,
                    mobile:user.mobile,
                    emailVerfied:user.emailVerfied,
                    mobileVerfied:user.mobileVerfied,
                    userId:user._id,
                   // notfications:user.notfications,
                  //  pendingRequestTo:user.pendingRequestTo,
                   // RecivedRequest:user.RecivedRequest,
                    status:user.status
                    

                });
        }catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            return next(err);
        }
        


}

const Logout = async (req,res,next)=>{
    //console.debug('logut run')
    const FCM = req.body.FCM ;
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const user = await CustomerUser.findById(req.userId);
    console.debug(req.token)
    const index = user.FCMJwt.indexOf(FCM);
    if(index>-1){
        user.FCMJwt.splice(index, 1);
    }
    await user.save();
    res.status(201).json({state:1,message:'FCM deleted'});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    
    
};

const ForgetPassword=async (req,res,next)=>{
    const email = req.body.email;
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error); 
        }
        const user = await CustomerUser.findOne({email:email});
        const buf = crypto.randomBytes(2).toString('hex');
        const hashedCode = await bycript.hash(buf,12)
        user.forgetPasswordCode = hashedCode;
        user.codeExpireDate =  Date.now()  + 3600000 ;
        await user.save();
        // await nodemailerMailgun.sendMail({
        //     to:email,
        //     from:'support test',
        //     subject:'Reset password',
        //     html:`
        //     <h1>Reset password</h1>
        //     <br><h4>that's your code to reset your password</h4>
        //     <br><h3>${buf}</h3>
        //     `
        //   });
        const Emailresult=await sendEmail(email,'ResetPassword',`
             <h1>Reset password</h1>
             <br><h4>that's your code to reset your password</h4>
             <br><h3>${buf}</h3>
         `)

          console.debug('Emailresult',Emailresult)
          
          res.status(200).json({state:1,message:'the code has been sent succefuly',email});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    


}

const VerfyCode = async (req,res,next)=>{
    const code  = req.body.code;
    const email=req.body.email
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const user = await CustomerUser.findOne({email:email});
    if(!user){
        const error = new Error('User not Found');
        error.statusCode = 404 ;
        return next(error) ;
    }  
    const match = await bycript.compare(code,user.forgetPasswordCode)
    if(!match){
        const error = new Error('wrong code!!');
        error.statusCode = 401 ;
        return next(error) ;
    }
    if(user.codeExpireDate<=Date.now()){
        const error = new Error('your code is expired');
        error.statusCode = 401 ;
        return next(error) ;
    }

    const token  = jwt.sign(
        {
            userId:user._id.toString()
        },
        process.env.JWT_PRIVATE_KEY,
        {expiresIn:'1h'}
     );


    res.status(200).json({state:1,message:'correct code',token})
    
}catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);
}

};    

const PasswordRest = (req,res,next)=>{ //put
    const password  = req.body.password;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }


    CustomerUser.findById(req.userId).then(user=>{
        if(!user){
            const error = new Error('User not Found');
            error.statusCode = 404 ;
            return next(error) ;
        }
    
        bycript.hash(password,12).then(hashed=>{
           // console.log(hashed);
            
            user.password = hashed ;
            return user.save();
        });
        
        
    }).then(u=>{
        
    
        res.status(201).json({state:1,message:"password updated"});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    });
};

const SendactivateEmail=async (req,res,next)=>{
    try{
    const user = await CustomerUser.findById(req.userId);
    const buf = crypto.randomBytes(2).toString('hex');
    const hashedCode = await bycript.hash(buf,12)
    user.EmailActiveCode = hashedCode;
    user.codeExpireDate =  Date.now()  + 3600000 ;
    await user.save();

    const Emailresult=await sendEmail(user.local.email,'ActivateEmail',`
    <h1>ActivateEmail</h1>
    <br><h4>that's your Activation code </h4>
    <br><h3>${buf}</h3>
`)


        res.status(200).json({state:1,message:'the code has been sent succefuly'});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    
    }
const VerfyActiveEmailCode=async (req,res,next)=>{
    const code  = req.body.code;
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
    const user = await CustomerUser.findById(req.userId);
    if(!user){
        const error = new Error('User not Found');
        error.statusCode = 404 ;
        return next(error) ;
    }  
    const match = await bycript.compare(code,user.EmailActiveCode)
    if(!match){
        const error = new Error('wrong code!!');
        error.statusCode = 401 ;
        return next(error) ;
    }
    if(user.codeExpireDate<=Date.now()){
        const error = new Error('your code is expired');
        error.statusCode = 401 ;
        return next(error) ;
    }

    user.emailVerfied=true;
    await user.save()
   // console.debug(user.emailVerfied)
    

    res.status(200).json({state:1,message:'your email is verfied'})
    
}catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);
}
}

const googleWithOuthData=async (req,res,next)=>{
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        return next(error) ; 
    }
        const {id,email,fullName,photo,FCM}=req.body
       // We're in the account creation process
       let existingUser = await CustomerUser.findOne({ "google.id":id });
       if (existingUser) {
           console.debug("user found in google")
        existingUser.FCMJwt.push(FCM)
         console.debug('user aready exist')
         const token  = jwt.sign(
            {
                userId:existingUser._id.toString()
            },
            process.env.JWT_PRIVATE_KEY
        );



        return res.status(200).json({state:1,token,userId:existingUser._id})


        }
 
        // Check if we have someone with the same email
        let existingUserLocal = await CustomerUser.findOne({ "local.email":email })
        if (existingUserLocal) {
            console.debug("user found in local")
          // We want to merge google's data with local auth
          existingUserLocal.FCMJwt.push(FCM)
          existingUserLocal.emailVerfied=true
          await existingUserLocal.save()
          const token  = jwt.sign(
            {
                userId:existingUserLocal._id.toString()
            },
            process.env.JWT_PRIVATE_KEY
        );



        return res.status(200).json({state:1,token,userId:existingUserLocal._id})


        }
 
        let existingUserfacebook = await CustomerUser.findOne({ "facebook.email": email })
        if (existingUserfacebook) {
            console.debug("user found in facebook")

                // const error = new Error('you already singed up with facebook acount with the same email try to login with it');
                // error.statusCode = 403 ;
                // return next(error) ;
                existingUserfacebook.FCMJwt.push(FCM)
                const token  = jwt.sign(
                    {
                        userId:existingUserfacebook._id.toString()
                    },
                    process.env.JWT_PRIVATE_KEY
                );
        
        
        
                return res.status(200).json({state:1,token,userId:existingUserfacebook._id})
        
          
        }
 
        const newUser = new CustomerUser({
            methods: 'google',
            google: {
              id,
              email    
            },
            email,
              name:fullName,
               photo,
            emailVerfied:true,
    
          });
          newUser.FCMJwt.push(FCM)

          await newUser.save();
        
     const token  = jwt.sign(
            {
                userId:newUser._id.toString()
            },
            process.env.JWT_PRIVATE_KEY
        );

        console.debug("new google user is created")


        return res.status(200).json({state:1,token, userId:newUser._id})


   
    
}catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    return next(err);
}
}
      
const facebookWithOuthData=async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            return next(error) ; 
        }
            const {id,email,fullName,photo,FCM}=req.body
           // We're in the account creation process
           let existingUser = await CustomerUser.findOne({ "facebook.id":id });
           if (existingUser) {
               console.debug('user found in facebook')
             existingUser.FCMJwt.push(FCM)
             console.debug('user aready exist')
             const token  = jwt.sign(
                {
                    userId:existingUser._id.toString()
                },
                process.env.JWT_PRIVATE_KEY
            );
    
    
    
            return res.status(200).json({state:1,token, userId:existingUser._id})
    
    
            }
     
            // Check if we have someone with the same email
            let existingUserLocal = await CustomerUser.findOne({ "local.email":email })
            if (existingUserLocal) {
                console.debug('user found in local')

              // We want to merge google's data with local auth
              existingUserLocal.FCMJwt.push(FCM)
              existingUserLocal.emailVerfied=true
              await existingUserLocal.save()
              const token  = jwt.sign(
                {
                    userId:existingUserLocal._id.toString()
                },
                process.env.JWT_PRIVATE_KEY
            );
    
    
    
            return res.status(200).json({state:1,token,userId:existingUserLocal._id})
    
    
            }
     
            let existingUserfacebook = await CustomerUser.findOne({ "google.email": email })
            if (existingUserfacebook) {
                console.debug('user found in google')

                    // const error = new Error('you already singed up with facebook acount with the same email try to login with it');
                    // error.statusCode = 403 ;
                    // return next(error) ;
                    existingUserfacebook.FCMJwt.push(FCM)
                    const token  = jwt.sign(
                        {
                            userId:existingUserfacebook._id.toString()
                        },
                        process.env.JWT_PRIVATE_KEY
                    );
            
            
            
                    return res.status(200).json({state:1,token,userId:existingUserfacebook._id})
            
              
            }
     
            const newUser = new CustomerUser({
                methods: 'facebook',
                facebook: {
                  id,
                  email,
                  
                },
                 email,
                 name:fullName,
                  photo
       
              });
              newUser.emailVerfied=true,
              await newUser.save();
              newUser.FCMJwt.push(FCM)

    
              await newUser.save();
            
         const token  = jwt.sign(
                {
                    userId:newUser._id.toString()
                },
                process.env.JWT_PRIVATE_KEY
            );
    
            console.debug('new user created facebook')

    
            return res.status(200).json({state:1,token,userId:newUser._id})
    
    
       
        
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    }

module.exports={

register,
login,
PasswordRest,
VerfyCode,
ForgetPassword,
Logout,
SendactivateEmail,
VerfyActiveEmailCode,
googleWithOuthData,
facebookWithOuthData


}