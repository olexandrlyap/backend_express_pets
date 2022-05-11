const mongoose = require('mongoose')
const { isEmail } = require('validator')

const { Schema } = mongoose

const profileSchema = new Schema({
    about: {
        type: String, 
        maxLength: 1000,
        trim: true,
        default: ''
    },
    public_email: {
        type: String,
        maxLength: 500,
        validate: [isEmail, 'please enter email'] ,
    },
    public_number: {
        type: Number,
        minLength: 9,
        maxLength: 9,
        trim: true,
        default: null
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
    location: {
        type: String,
        maxLength: 1000,
        default: ''
    },
    main_image: {
        id: { type: String, required: [true, 'image must be provided'] },
        url: { type: String, required: [true, 'image must be provided'] },
    },
    images: [{
        id: { type: String, required: true },
        url: { type: String, required: true },
    }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true })

// one user = one profile
profileSchema.index({ user: 1 }, { unique: true })

module.exports = mongoose.model('Profile', profileSchema)