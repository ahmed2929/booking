const passport = require('passport');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const customerUser = require('../../../../models/CustomerUser');

// Google OAuth Strategy
passport.use('googleToken', new GooglePlusTokenStrategy({
  clientID: '916702295984-vk5t9jpljeci6a2kgc08g1qqmfhkg1m4.apps.googleusercontent.com',
  clientSecret: '22zUzPcLEmVbvHYZUhh5jpcb',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Could get accessed in two ways:
    // 1) When registering for the first time
    // 2) When linking account to the existing one

    // Should have full user profile over here
    console.log('testing fcm',req.body.FCM)
    console.log('profile', profile);
    console.log('accessToken', accessToken);
    //console.log('refreshToken', refreshToken);

      // We're in the account creation process
      let existingUser = await customerUser.findOne({ "google.id": profile.id });
      if (existingUser) {
          req.user=existingUser
          existingUser.FCMJwt.push(req.body.FCM)
        return done(null, existingUser);
      }

      // Check if we have someone with the same email
      let existingUserLocal = await customerUser.findOne({ "local.email": profile.emails[0].value })
      if (existingUserLocal) {
        // We want to merge google's data with local auth
        req.user=existingUserLocal
        existingUserLocal.FCMJwt.push(req.body.FCM)
        await existingUserLocal.save()
        return done(null, existingUserLocal);
      }

      let existingUserfacbook = await customerUser.findOne({ "facebook.email": profile.emails[0].value })
      if (existingUserfacbook) {
        // We want to merge google's data with local auth
        req.user=existingUserfacbook
        existingUserfacbook.FCMJwt.push(req.body.FCM)
        await existingUserfacbook.save()
        return done(null, existingUserfacbook);
      }
      
      const newUser = new customerUser({
        methods: 'google',
        google: {
          id: profile.id,
          email: profile.emails[0].value,    
        },
        email: profile.emails[0].value,
          name:profile.displayName,
           photo:profile.photos[0].value,
        emailVerfied:true,

      });
      req.user=newUser
      newUser.FCMJwt.push(req.body.FCM)
      await newUser.save();
      done(null, newUser);
    
  } catch(error) {
    done(error, false, error.message);
  }
}));


 passport.use('facebookToken', new FacebookTokenStrategy({
   clientID: '297584527980729',
   clientSecret: '3055299f37c537ed0cc0172d4767dda6',
   passReqToCallback: true
 }, async (req, accessToken, refreshToken, profile, done) => {
   try {
     console.log('profile', profile);
     console.log('accessToken', accessToken);
    
       // We're in the account creation process
      let existingUser = await customerUser.findOne({ "facebook.id": profile.id });
      if (existingUser) {
        req.user=existingUser
        console.debug('user aready exist')
        return done(null, existingUser);
       }

       // Check if we have someone with the same email
       let existingUserLocal = await customerUser.findOne({ "local.email": profile.emails[0].value })
       if (existingUserLocal) {
         // We want to merge google's data with local auth
         req.user=existingUserLocal
         existingUserLocal.FCMJwt.push(req.body.FCM)
         await existingUserLocal.save()
         return done(null, existingUserLocal);
       }

       let existingUsergoogle = await customerUser.findOne({ "google.email": profile.emails[0].value })
       if (existingUsergoogle) {
         // We want to merge google's data with local auth
         existingUsergoogle.FCMJwt.push(req.body.FCM)
         await existingUsergoogle.save()
         req.user=existingUsergoogle
         return done(null, existingUsergoogle);
       }

       const newUser = new customerUser({
         methods: 'facebook',
         facebook: {
           id: profile.id,
           email: profile.emails[0].value,
           
         },
          email: profile.emails[0].value,
          name:profile.displayName,
           photo:profile.photos[0].value

       });
       newUser.emailVerfied=true,
      req.user=newUser
      newUser.FCMJwt.push(req.body.FCM)

       await newUser.save();
       done(null, newUser);
     
   } catch(error) {
     console.debug(error)
     done(error, false, error.message);
   }
 }));

 