const admin = require("firebase-admin");
const io = require("../socket.io.settings");
const Cuser=require('../models/CustomerUser')
const Tuser=require('../models/TrederUsers')
const Notificaton=require('../models/notifications')
//  data notificaton userid status
const send = async (action,data, notification,userId,status) => {
  try {
    var user; 
    if(status==0){ //for customer
      user =await Cuser.findById(userId)
    }else{

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
    var token
    if(user.FCMJwt.length==0){
      if (token.length == 0) {
        return "no token";
      }
    }
token=[
  "cbc8f59160b949199b40ffe21cd2253ef893e4b244944b76ba31b8eaa5f09e69",
  "a2ee9981afd84d77aa1a2bcf93df49c27d5df254c139458bdace96f7fd50088a",
  "b8129fb4ebf5423b985075b62f9322a8d67bdec69d3c441bd871f12ede46c93c"
]
console.debug(token)
    var message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        score: '850',
        time: '2:45',
        passTypeID:'pass.attidomobile.test'
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
      token: user.FCMJwt[0],
    };

    const messageRes = await admin.messaging().send(message);

    return messageRes;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

const sendAll = async (body, notfi) => {
  try {
    
    const users = await User.find({ email: { $ne: "guest@guest.com" } }).select('FCMJwt').lean();
    
    let result = [];
    let id = [];
    for (let u of users) {
      if (u.FCMJwt.length > 0) {
        result = result.concat(u.FCMJwt);
        id = id.concat(u._id);
      }
      if (result.length >= 450) {
        const R = result;
        const I = id;
        await send(R, body, notfi, I);
        result.length = [];
        id.length = [];
      }
    }

    const r = await send(result, body, notfi, id);

    return r;

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};


module.exports={
  send,
  sendAll
}