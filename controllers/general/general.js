const mongoose=require('mongoose');
var bycript = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const ADS = require('../../models/ADS');
const MarketCatigory=require('../../models/catigory.js');
const { json } = require('body-parser')
const { countDocuments } = require('../../models/ADS');
const fs = require('fs');
const path=require('path')
const CustomerUser=require('../../models/CustomerUser')
const trederUser=require('../../models/TrederUsers')
const Product=require('../../models/shopProducts')
const AvilableServices=require('../../models/AvilableServices')
const Request=require('../../models/Request');
const { use } = require('passport');
const paginate=require('../../helpers/general/helpingFunc').paginate
const shopcatigory=require('../../models/shopcatigory');
const Promo=require('../../models/promocode')
const { connected } = require('process');
const TrederUsers = require('../../models/TrederUsers');
const Search = async (req, res, next) => {
    const search = req.query.search;
    const type = req.query.type    || "shop";
    const page = req.query.page    || 1 ;
    const itemPerPage = 10 ;
    let totalItems;
    try {
        if(type=='shop'){
        const cato=await shopcatigory.findOne({
            
          $or:[{name:new RegExp( search.trim() , 'i')},{arb_name:new RegExp( search.trim() , 'i')}]
        
        })
        console.debug(cato)
        var searchParams=[]
        if(cato){
            console.debug('a7a it shouldnt run')

            searchParams=[
                { title: new RegExp( search.trim() , 'i') },
                { catigory: cato._id },
                { desc: new RegExp( search.trim() , 'i') },
               
              ];

        }else{
            console.debug('else rin')
            searchParams=[
                { title: new RegExp( search.trim() , 'i') },
                { desc: new RegExp( search.trim() , 'i') },
               
              ]

        }
        
        totalItems = await Product.find({
            $or: searchParams,
            avilableNumber:{ $gte: 1}
          }).countDocuments();
          result = await Product.find({
            $or: searchParams,
            avilableNumber:{ $gte: 1}
          }).sort({ createdAt: -1 })
           // .populate({ path: "user", select: "name email mobile" })
            .populate({ path: "catigory", select: "name" })
            .skip((page - 1) * itemPerPage)
            .limit(itemPerPage);
            res.status(200).json({
                state: 1,
                totalItems:totalItems,
                searchResult: result,
              });
            }else if(type=="market"){

                const cato=await MarketCatigory.findOne({
                  $or:[{name:new RegExp( search.trim() , 'i')},{arb_name:new RegExp( search.trim() , 'i')}]

                
                })
              //  .populate({path:'ads'})
                //console.debug(cato)
                var searchParams=[]
                if(cato){
                    
        
                    searchParams=[
                        { title: new RegExp( search.trim() , 'i') },
                        { catigory: cato._id },
                        { details: new RegExp( search.trim() , 'i') },
                        { streetAdress: new RegExp( search.trim() , 'i') },
                        { city: new RegExp( search.trim() , 'i') },
                      
                        
                      ];
        
                }else{
                    console.debug('else rin')
                    searchParams=[
                        { title: new RegExp( search.trim() , 'i') },
                        { details: new RegExp( search.trim() , 'i') },
                        { streetAdress: new RegExp( search.trim() , 'i') },
                        { city: new RegExp( search.trim() , 'i') },
                      
                        
                      ];
        
                }
                
                totalItems = await ADS.find({
                    $or: searchParams,
                    
                  }).countDocuments();
                  result = await ADS.find({
                    $or: searchParams,
                 
                  }).sort({ createdAt: -1 })
                   // .populate({ path: "user", select: "name email mobile" })
                    .populate({ path: "catigory", select: "name" })
                    .skip((page - 1) * itemPerPage)
                    .limit(itemPerPage);
                    console.debug(cato)
                    // if(!result&&cato){
                     
                    //   return res.status(200).json({
                    //     state: 1,
                    //     totalItems:totalItems,
                    //     searchResult: cato.ads,
                    //   });

                    //}
                    var fResult=result.map(obj=>{
                      return{
                        images:obj.images,
                        _id:obj._id,
                        city:obj.city,
                        streetAdress:obj.streetAdress,
                        price:obj.price,
                        services:obj.services,
                        title:obj.title
                      }
                    })

                    res.status(200).json({
                        state: 1,
                        totalItems:totalItems,
                        searchResult: fResult,
                      });



            }else if(type=='user'){
           
              
                var  searchParams=[
                      { name: new RegExp( search.trim() , 'i') },
                      { email: new RegExp( search.trim() , 'i') },
                    ];
      
              
              totalItemsT = await TrederUsers.find({
                  $or: searchParams,
                  
                }).countDocuments();
              
                    
                  resultT = await TrederUsers.find({
                    $or: searchParams,
                 
                  }).sort({ createdAt: -1 })
                   // .populate({ path: "user", select: "name email mobile" })
                    .select('name _id email photo status')
                    .skip((page - 1) * itemPerPage)
                    .limit(itemPerPage);

                
                  totalItemsC = await TrederUsers.find({
                    $or: searchParams,
                    
                  }).countDocuments();
                  resultC = await CustomerUser.find({
                    $or: searchParams,
                 
                  }).sort({ createdAt: -1 })
                   // .populate({ path: "user", select: "name email mobile" })
                    .select('name _id email photo status')
                    .skip((page - 1) * itemPerPage)
                    .limit(itemPerPage);

                



                
                 
                  res.status(200).json({
                      state: 1,
                      totalItems:totalItemsT+totalItemsC,
                      searchResult: resultT.concat(resultC),
                    });


               
            }else{
              res.status(422).json({
                state: 0,
                msg: 'invalid type',
              });
            }
      
       
     
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

module.exports={
    Search,
    

}