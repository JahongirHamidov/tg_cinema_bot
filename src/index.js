const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const config = require('./config')
const helper = require('./helper')
const kb = require('./keyboard-button')
const keyboard = require('./keyboard')
const connectDb = require('../db')

connectDb()
helper.logStart()


const Film = require('./models/film.model.js')
const Cinema = require('./models/cinema.model')




////////////////////////////////////////
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
        case kb.film.comedy:
            sendFilmsByQuery(chatId, {type:'comedy'})
            break
        case kb.film.action:
            sendFilmsByQuery(chatId, {type:'action'})
            break
        case kb.film.random:
            sendFilmsByQuery(chatId, {})
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

bot.onText(/\/f(.+)/, (msg, [source, match]) => {
    const filmUuid = helper.getItemUuid(source)
    
    const chatId = helper.getChatId(msg)

    Film.findOne({uuid:filmUuid}).then(film=>{
        bot.sendPhoto(chatId, film.picture, {
            caption: `\nName: ${film.name}\nYear: ${film.year}\nRating: ${film.rate}\nLength: ${film.length}\nCountry: ${film.country}\n`,
            reply_markup:{
                inline_keyboard: [
                    [
                        {
                            text: 'Add favourites',
                            callback_data: film.uuid
                        },
                        {
                            text: 'Show cinemas',
                            callback_data: film.uuid
                        }
                    ],
                    [
                        {
                            text: `Kinopoisk ${film.name}`,
                            url: film.link
                        }
                    ]
                ]
            }
        })
    })

})

///////////////////////////////////

function sendFilmsByQuery(chatId, query){
    Film.find(query).then(film=>{
        const html = film.map((f,i)=>{
            return `<b>${i+1}</b> ${f.name} - /f${f.uuid}`
        }).join('\n')
    
        sendHTML(chatId, html, 'films')

    })
}

function sendHTML(chatId, html, kbName = null){
    const options = {
        parse_mode: 'HTML'
    }
    if(kbName){
        options['reply_markup'] = {
            keyboard: keyboard[kbName]
        }
    }
    bot.sendMessage(chatId, html, options)
}
