const mongoose = require('mongoose')


const { Schema } = mongoose

const favoritePetsSchema = new Schema({
  /*   pets: [{
        type: mongoose.Types.ObjectId,
        ref: 'Pet',
        required: true,
    }], */
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