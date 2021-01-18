const mongoose = require('mongoose')
const config = require('./src/config')


// mongoose.Promise = global.Promise
const connectDb = async () => {
    const conn = mongoose.connect(config.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    console.log('DB Connected')        
}

module.exports = connectDb