const nodemailer = require('nodemailer'); 


let mailTransporter = nodemailer.createTransport({ 
	service: process.env.domainName, 
	auth: { 
		user:  process.env.emailAddress, 
		pass: process.env.emailPassword
	} 
});

const sendEmail=async (to,subject,html )=>{

  let mailDetails = { 
    from: process.env.emailAddress, 
    to, 
    subject , 
    html
  }; 
  
 const result =await mailTransporter.sendMail(mailDetails)
 return result
    
  


}



module.exports={
  sendEmail
}