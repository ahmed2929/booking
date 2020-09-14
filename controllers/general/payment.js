const https = require('https');
const querystring = require('querystring');
const unirest = require('unirest');
const {validationResult, Result} = require('express-validator');

exports.createCheckOut = async (req,res,next) => {
    try {
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
        const {price}=req.body
        if(!Number(price)){
        const error = new Error('invaild price');
        error.statusCode = 422 ;
        return next( error) ;
        }
        
        var data = querystring.stringify({
            'entityId': process.env.HYPERPAY_ENTITYID,
            'amount': price,
            'currency': 'AED',
            'paymentType': 'DB'
        });
        const { body, status } = await unirest
            .post(process.env.HYPERPAY_URL + '/v1/checkouts')
            .headers({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
                'Authorization': process.env.HYPERPAY_AUTHRIZATION
            })
            .send(data);
        // body, status 
         console.debug('status',status)
         if(status!==200){
            var message=body.result.description
            const error = new Error(message);
            error.statusCode = 503 ;
            return next(error) ; 
         }
         console.debug('body',body)

         if(body.result.code!=="000.200.100"){
            var message='faild to create Checkout'
            const error = new Error(message);
            error.statusCode = 503 ;
            return next(error) ; 
         }
         res.status(200).json({state:1,checkoutId:body.id});



    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err
    }

}

exports.getStatus = async (req,res,next) => {
    try {
        const {checkoutId}=req.body

        const { body, status } = await unirest
            .get(process.env.HYPERPAY_URL + `/v1/checkouts/${checkoutId}/payment?entityId=${process.env.HYPERPAY_ENTITYID}`)
            .headers({
                'Authorization': process.env.HYPERPAY_AUTHRIZATION
            })
       



 const reg1 = new RegExp("^(000\.000\.|000\.100\.1|000\.[36])", "m");
 const reg2 = new RegExp("^(000\.400\.0[^3]|000\.400\.100)", 'm');


 console.debug('status',status) 
 console.debug('body',body) 

  if (!reg1.test(body.result.code.toString()) && !reg2.test(body.result.code.toString())) {
      const error = new Error(`payment faild`);
     error.statusCode = 402;
      error.PayMentDone = false;
      return next (error);
  }


  console.debug(body.result.code)
  if(body.result.code.toString()==='000.100.110'){

    return res.status(200).json({
        message:'payment successfully done ',
        paymentId:body.id,
        state:1,
       
    })


  }

   res.status(503).json({
    message:'payment failed',
    state:0,
   
})

  


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err
    }

}



exports.getPaymentReport = async (checkoutId) => {
    try {

        const { body, status } = await unirest
            .get(process.env.HYPERPAY_URL + `/v1/query/${checkoutId}?entityId=${process.env.HYPERPAY_ENTITYID}`)
            .headers({
                'Authorization': process.env.HYPERPAY_AUTHRIZATION
            })
        return { body, status };

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        throw err
    }

}











// const reg1 = new RegExp("^(000\.000\.|000\.100\.1|000\.[36])", "m");
// const reg2 = new RegExp("^(000\.400\.0[^3]|000\.400\.100)", 'm');



// if (!reg1.test(body.result.code.toString()) && !reg2.test(body.result.code.toString())) {
//     const error = new Error(`payment error`);
//     error.statusCode = 402;
//     error.state = 20;
//     throw error;
// }