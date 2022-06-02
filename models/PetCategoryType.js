const mongoose = require('mongoose')



const { Schema } = mongoose

const petCategoryTypeSchema = new Schema({
    types: {
        type: [String],
        default: ['kočka', 'pes', 'ostatní']
    }

},  { timestamps: true })


module.exports = mongoose.model('PetCategoryType', petCategoryTypeSchema)