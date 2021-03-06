const express=require('express');
const Router=express.Router();
const {body} =require('express-validator')  
const { json } = require('body-parser');
const verfiyToken=require('../../../helpers/Auth/TrederAuth')
const uploadImage=require('../../../helpers/uploadImage');
const bodyParser = require('body-parser');
const conttroller=require('../../../controllers/market/general')

 Router.get('/getAvilableCatigories/:catigoryId',conttroller.getAvilableCatigories)
 Router.get('/getAvilableCatigories',conttroller.getAvilableCatigories)
 Router.get('/getAvilableServices/:serviceId',conttroller.getAvilableServices)
 Router.get('/getAvilableServices',conttroller.getAvilableServices)
 Router.get('/getCatigoriesWithAds',conttroller.getADSWithCatigrories)
 Router.get('/getAvilabecites',conttroller.getAvilabecites)
 Router.get('/getAdDetailsById/:AdId',conttroller.getAdDetailsById)
 Router.get('/getAdDetailsById/',conttroller.getAdDetailsById)
 Router.get('/getCatigoriesAdsById/:catigoryId',conttroller.getCatigoriesAdById)
 Router.get('/getAdsFilter/',conttroller.getAdsFilter)
 Router.get('/getMostView/',conttroller.getMostView)
 Router.get('/getMostView/',conttroller.getMostView)
 Router.get('/getAllads/',conttroller.getAllads)
 Router.get('/getPolicy/',conttroller.getPolicy)
 
 




module.exports=Router
