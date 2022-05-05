const mongoose = require('mongoose')
const { isEmail } = require('validator')

const { Schema } = mongoose

const profileSchema = new Schema({
    about: {
        type: String, 
        maxLength: 1000,
        minLength: 15,
        trim: true,
    },
    public_email: {
        type: String,
        maxLength: 500,
        validate: [isEmail, 'please enter email']  
    },
    public_number: {
        type: Number,
        minLength: 9,
        maxLength: 9,
        trim: true,
    },
    website: {
        type: String,
        maxLength: 1000,
        default: ''
    },
    facebook: {
        type: String,
        maxLength: 1000,
        default: ''
    },
    twitter: {
        type: String,
        maxLength: 1000,
        default: ''
    },
    instagram: {
        type: String,
        maxLength: 1000,
        default: ''
    },
})

module.exports = mongoose.model('Profile', profileSchema)