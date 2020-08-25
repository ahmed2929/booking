module.exports = async (req,res,next)=>{
  
        if(req.user.emailVerfied==false){
            const error = new Error('sorry you need to activite your email first ');
            error.statusCode = 403 ;
            return next(error) ;

        }
       
        next();

    
};