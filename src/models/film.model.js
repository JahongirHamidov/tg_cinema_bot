const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FilmSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type:{
        type:String,
        required: true,
    },
    uuid:{
        type: String,
        required: true
    },
    year:{
        type: String,
    },
    rate: {
        type: Number,
    },
    length:{
        type: String
    },
    country:{
        type:String,
        required:true
    },
    link:{
        type: String
    },
    picture:{
        type:String,
    },
    cinemas:{
        type: [String],
        default: []
    }
})

const Film = mongoose.model('Film', FilmSchema )
module.exports = Film