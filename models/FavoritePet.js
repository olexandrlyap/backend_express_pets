const mongoose = require('mongoose')


const { Schema } = mongoose

const favoritePetsSchema = new Schema({
    // schema for user to save favorites PETS, PROFILES, ETC... Multiple different models
    // 1.) one schema for multiple models
    // 2.) concentrated schema. favoritePetsSchema, favoriteProfilesSchema etc... Single model = Single Favorite
    pets: [{
        type: mongoose.Types.ObjectId,
        ref: 'Pet',
        required: true,
    }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },

},  { timestamps: true })

module.exports = mongoose.model('FavoritePet', favoritePetsSchema )