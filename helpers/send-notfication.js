const admin = require("firebase-admin");
const io = require("../socket.io.settings");
const Cuser=require('../models/CustomerUser')
const Tuser=require('../models/TrederUsers')
const Notificaton=require('../models/notifications');
const TrederUsers = require("../models/TrederUsers");
const customer = require("../controllers/market/customer");
//  data notificaton userid status

const send = async (action,data, notification,userId,status) => {
  try {
    console.debug('noti',notification)
    var user; 
    if(status==0){ //for customer
      user =await Cuser.findById(userId)
    }else if(status==1){

      user =await Tuser.findById(userId)
    }
    var Newnotification= new Notificaton({
      data,
      notification,
      action:action
    })
    await Newnotification.save()
    user.notfications.push(Newnotification._id)
    await user.save()
    console.debug(`notfication::${userId}`)
    io.getIo().emit(`notfication::${userId}`,{
      action:action,
      notfications: {
        data: data,
        notification: notification,
      }
      
    })
    if(user.FCMJwt.length==0){
      
        return "no token";
      
    }


    var message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      android: {
        notification: {
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
      topic: "X",
      token:user.FCMJwt[0]
    };

    const messageRes = await admin.messaging().sendMulticast(message);

    return messageRes;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

const sendAll = async (action,data, notification,status) => {
  try {
    const userPerOperation = 100;
    var users 
    if(status==0){
      const total = await Cuser.find({}).countDocuments() 

      for (let i = 1; i <= Math.ceil(total / 100); i++) {
        users =await Cuser.find().select('FCMJwt').lean()
          .skip((i - 1) * userPerOperation)
          .limit(userPerOperation);
          for (u of users) {
            await send(action,data, notification, u._id,0);
           
          }
         

      }
      

    return 'done';
    }else if(status==1){

      const total = await Tuser.find({}).countDocuments() 

      for (let i = 1; i <= Math.ceil(total / 100); i++) {
        users =await Tuser.find().select('FCMJwt').lean()
          .skip((i - 1) * userPerOperation)
          .limit(userPerOperation);
          for (u of users) {
            console.debug('u',u._id)
            await send(action,data, notification, u._id,1);
           
          }
         

      }
    

    return 'done';
    }else{
      return 'invalid status'
    }

    
    
    

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};



// const send = async (data, notfi, user, path) => {
//   try {

//     let token_en = [];
//     let token_ar = [];

//     let index = -1;
//     admin.apps.forEach((app, ind) => {
//       if (app.name == path) {
//         index = ind;
//       }
//     });

//     for(i of user){
//       const notfication = new Notfication({
//         path: path,
//         user: i._id,
//         data: data,
//         notification: notfi,
//         date: new Date().getTime().toString()
//       });

//       await notfication.save();

//       io.getIO().emit("notfication", {
//         action: "notfication",
//         userId: i._id,
//         notfications: {
//           data: data,
//           notification: notfi,
//         },
//       });

//       i.FCMJwt.forEach(tok => {
//         if (tok.lang == 'ar') {
//           token_ar.push(tok.token);
//         } else if (tok.lang == 'en') {
//           token_en.push(tok.token);
//         }
//       });

//     }

//     const message_ar = {
//       notification: {
//         title: notfi.title_ar,
//         body: notfi.body_ar,
//       },
//       data: data,
//       android: {
//         notification: {
//           sound: "default",
//         },
//       },
//       apns: {
//         payload: {
//           aps: {
//             sound: "default",
//           },
//         },
//       },
//       topic: "X",
//       tokens: token_ar,
//     };
//     const message_en = {
//       notification: {
//         title: notfi.title_en,
//         body: notfi.body_en,
//       },
//       data: data,
//       android: {
//         notification: {
//           sound: "default",
//         },
//       },
//       apns: {
//         payload: {
//           aps: {
//             sound: "default",
//           },
//         },
//       },
//       topic: "X",
//       tokens: token_en,
//     };

//     if (message_en.tokens.length > 0) {
//       const messageRes = await admin.apps[index].messaging().sendMulticast(message_en);
//       console.log( messageRes);
//     }
//     if (message_ar.tokens.length > 0) {
//       const messageRes = await admin.apps[index].messaging().sendMulticast(message_ar);
//       console.log(messageRes);
//     }

//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     throw err;
//   }
// };

// const sendAll = async (data, notfi, path) => {
//   try {
//     const userPerOperation = 100;
//     let users;
  
//     if (path == 'client') {
//       const total = await Client.find({}).countDocuments();
//       for (let i = 1; i <= Math.ceil(total / 100); i++) {
//         users = await Client.find({}).select('FCMJwt')
//           .skip((i - 1) * userPerOperation)
//           .limit(userPerOperation);
//           await send(data, notfi, users, path);

//       }

//     } else if (path == 'seller') {
//       const total = await Seller.find({}).countDocuments();
//       for (let i = 1; i <= Math.ceil(total / 100); i++) {
//         users = await Seller.find({}).select('FCMJwt')
//           .skip((i - 1) * userPerOperation)
//           .limit(userPerOperation);
//           await send(data, notfi, users, path);

//       }
//     }

//     return 'done';

//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 500;
//     }
//     throw err;
//   }
// };






















module.exports={
  send,
  sendAll
}