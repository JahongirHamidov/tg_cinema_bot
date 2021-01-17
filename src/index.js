const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const helper = require('./helper')



const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {
    console.log('Working')
    bot.sendMessage('')
})