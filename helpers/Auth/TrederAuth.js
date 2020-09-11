const jwt = require('jsonwebtoken');

const User = require('../../models/TrederUsers');

module.exports = async (req,res,next)=>{
    console.debug('auth run')
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('not Authorized!!');
        error.statusCode = 401;
        return next(error);
    }
    const token =req.get('Authorization').split(' ')[1];
    //console.debug('token is',token)
    let decodedToken;
    try{
        //console.debug(process.env.JWT_PRIVATE_KEY)

        decodedToken = await jwt.verify(token,process.env.JWT_PRIVATE_KEY);
       console.debug('decoded token',decodedToken)
        if(!decodedToken){
            const error = new Error('not Authorized!!');
            error.statusCode = 401;
            throw error;
        }

        const user   = await User.findById(decodedToken.userId) ;
     //  console.debug('user',user)

        if(!user){
            console.debug('user not found run')
            const error = new Error('user not found');
            error.statusCode = 404 ;
            return next(error) ;
        }

        if(user.blocked==true){
            const error = new Error('تم حظرك من البرنامج لسوء الاستخدام');
            error.statusCode = 403 ;
            return next(error) ;

        }
            
        req.userId = user._id;
        req.user=user
       // console.debug(req.userId)
       
        next();

    } catch(err){
        console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    
};