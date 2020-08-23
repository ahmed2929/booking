const express=require('express');
const Router=express.Router();
const {body} =require('express-validator')  
const { json } = require('body-parser');
//const verfiyToken=require('../../../helpers/Auth/TrederAuth')
//const uploadImage=require('../../../helpers/uploadImage');
//const bodyParser = require('body-parser');
const conttroller=require('../../controllers/shop/shop')
const marketController=require('../../controllers/market/general')
 Router.get('/getAllProducts',conttroller.getAllProducts)
 Router.get('/getProductsByCatigory/:id',conttroller.getProductsByCatigory)
 Router.get('/getProductsByCatigory/',conttroller.getProductsByCatigory)
 Router.get('/getProductByID/:id',conttroller.getProductByID)
 Router.get('/getProductByID/',conttroller.getProductByID)
 Router.post('/checkPromo',conttroller.checkPromo)
 Router.get('/getShopAvilablCatigory/',marketController.getShopAvilablCatigory)

module.exports=Router
