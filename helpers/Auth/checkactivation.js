module.exports = async (req,res,next)=>{
    try{
      
        if(req.user.emailVerfied==false){
            const error = new Error('you need to active your email first');
            error.statusCode = 403 ;
            return next(error) ;

        }
            
      
       
        next();

    } catch(err){
        //console.debug(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        return next(err);
    }
    
};