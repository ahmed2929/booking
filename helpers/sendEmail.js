const nodemailer = require('nodemailer'); 


let mailTransporter = nodemailer.createTransport({ 
	service: 'gmail', 
	auth: { 
		user: 'ak8911938@gmail.com', 
		pass: 'BOOKINGTEST123'
	} 
});

const sendEmail=async (to,subject,html )=>{

  let mailDetails = { 
    from: 'ak8911938@gmail.com', 
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