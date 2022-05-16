const mongoose = require('mongoose')


const { Schema } = mongoose

const favoritePetsSchema = new Schema({
    pet: {
        type: mongoose.Types.ObjectId,
        ref: 'Pet',
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },

},  { timestamps: true })

module.exports = mongoose.model('FavoritePet', favoritePetsSchema )