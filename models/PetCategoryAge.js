const mongoose = require('mongoose')

const { Schema } = mongoose

const petCategoryAgeSchema = new Schema({
    types: {
        type: [String],
        default: ['mládě', 'dospělý', 'senior']
    }
},  { timestamps: true })


module.exports = mongoose.model('PetCategoryAge', petCategoryAgeSchema )