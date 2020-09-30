const mongoose = require('mongoose')
const Schema = mongoose.Schema

const movieItemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    poster_path: {
        type: String,
        required: true
    }
})

const MovieItem = mongoose.model('movieDB', movieItemSchema)

module.exports = MovieItem
