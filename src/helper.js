module.exports = {
    logStart(){
        console.log('bot has been started...')
    },
    getChatId(msg){
        return msg.chat.id
    }
}