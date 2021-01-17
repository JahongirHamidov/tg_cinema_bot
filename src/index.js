const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const helper = require('./helper')
const kb = require('./keyboard-button')
const keyboard = require('./keyboard')

helper.logStart()

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {
    console.log('Working')
    const chatId = helper.getChatId(msg)

    switch (msg.text) {
        case kb.home.favourite:
            break;
        case kb.home.films:
            bot.sendMessage(chatId, `Select genre: `, {
                reply_markup: {keyboard: keyboard.films}
            } )
            break
        case kb.home.cinemas:
            break
        case kb.back.back:
            bot.sendMessage(chatId,'back', {
                reply_markup:{keyboard: keyboard.home}
            } )
            break
        default:
            break;
    }
})

bot.onText(/\/start/, msg => {
    const text = `salom, ${msg.from.first_name}\n Kategoriyani tanlang`
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup:{
            keyboard: keyboard.home
        }
    })

})