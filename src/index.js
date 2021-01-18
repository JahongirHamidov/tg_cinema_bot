const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const config = require('./config')
const helper = require('./helper')
const kb = require('./keyboard-button')
const keyboard = require('./keyboard')
const connectDb = require('../db')
const geolib = require('geolib')
const _ = require('lodash')

connectDb()
helper.logStart()


const Film = require('./models/film.model.js')
const Cinema = require('./models/cinema.model')
const User = require('./models/user.model')

const database = require('../database.json')

//database.cinemas.forEach(c=>new Cinema(c).save().catch(e=>console.log(e)))

const ACTION_TYPE = {
    TOGGLE_FAV_FILM: 'tff',
    SHOW_CINEMAS: 'sc',
    SHOW_CINEMAS_MAP: 'scm',
    SHOW_FILMS: 'sf'
}

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
            bot.sendMessage(chatId, 'Send location', {
                reply_markup:{
                    keyboard: keyboard.cinemas
                }
            })
            break
        case kb.back.back:
            bot.sendMessage(chatId,'back', {
                reply_markup:{keyboard: keyboard.home}
            } )
            break
        default:
            break;
    }
    if(msg.location){
        console.log(msg.location)
        getCinemasInCoords(chatId, msg.location)
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
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.TOGGLE_FAV_FILM,
                                filmUuid: film.uuid
                            })
                        },
                        {
                            text: 'Show cinemas',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_CINEMAS,
                                cinemaUuid: film.cinemas
                            })
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

bot.onText(/\/c(.+)/, (msg,[source,match])=>{
    const cinemaUuid = helper.getItemUuid(source)
    const chatId = helper.getChatId(msg)

    Cinema.findOne({uuid:cinemaUuid}).then(cinema=>{

        bot.sendMessage(chatId, `Cinema ${cinema.name}`, {
            reply_markup:{
                inline_keyboard:[
                    [
                        {
                            text: cinema.name,
                            url: cinema.url
                        },
                        {
                            text: 'See in map',
                            callback_data: JSON.stringify({
                                type:ACTION_TYPE.SHOW_CINEMAS_MAP,
                                lat: cinema.location.latitude,
                                lon: cinema.location.longitude
                            })
                        }
                    ],
                    [
                        {
                            text: 'Show movies',
                            callback_data: JSON.stringify({
                                type: ACTION_TYPE.SHOW_FILMS,
                                filmUuids: cinema.films
                            })
                        }
                    ]
                ]
            }
        })
    })
})

bot.on('callback_query', query=>{
    let data
    try {
        data = JSON.parse(query.data)
    } catch (e) {
        throw new Error('Data is not an object')
    }

    const {type} = data

    if(type === ACTION_TYPE.SHOW_CINEMAS_MAP){

    } else if(type === ACTION_TYPE.SHOW_CINEMAS){
        
    }

    console.log(query.data)
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

function getCinemasInCoords(chatId, location){
    Cinema.find({}).then(cinemas=>{

        cinemas.forEach(c=>{
            c.distance = geolib.getDistance(location, c.location)
        })
        cinemas = _.sortBy(cinemas, 'distance')

        const html = cinemas.map((c, i) => {
            return `<b>${i+1}</b> ${c.name}. <em>distance</em>=<strong>${c.distance/1000}</strong> km /c${c.uuid}`
        }).join('\n')
        
        sendHTML(chatId, html, 'home')
    })
}