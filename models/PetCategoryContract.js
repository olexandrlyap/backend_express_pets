const mongoose = require('mongoose')

const { Schema } = mongoose

const petCategoryContractSchema = new Schema({
    types: {
        type: [String],
        default: 
        [ 
            'koupě', 
            'útulek', 
            'darování', 
            'krytí'
        ]
    }


},  { timestamps: true })


module.exports = mongoose.model('PetCategoryContract', petCategoryContractSchema)