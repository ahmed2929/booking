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


    var message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
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

   // const messageRes = await admin.messaging.send(message);

    //return messageRes;
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