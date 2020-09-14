const express=require('express');
const Router=express.Router();
const controller=require('../../controllers/general/payment')
const {body} =require('express-validator')  
const verfiyToken=require('../../helpers/Auth/viryfiyBoth')
Router.post('/CreateCheckout',[
    body('price').isNumeric()
],verfiyToken,controller.createCheckOut)

Router.post('/getStatus',[
    body('checkoutId').notEmpty()
],verfiyToken,controller.getStatus)



module.exports=Router
