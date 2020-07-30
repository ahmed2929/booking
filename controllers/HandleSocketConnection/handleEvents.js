const io=require('../../socket.io.settings')

module.exports=async (socket)=>{

socket.on('::chat/new-massage/sent',async(data)=>{
  
    socket.emit(`::chat/new-massage/recive/${to}`,{
        chatId,
        sender,
        to,
        mesg


    })
    




})



}