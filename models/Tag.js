const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const { Schema } = mongoose

const tagSchema = new Schema({
    name: {
        type: String,
        maxLength: 50,
        minLength: 2,
        trim: true,
        lowercase: true,
        unique: true
    },
    slug: {
        type: String,
        slug: ["name"],
        unique: true,
        index: true,
        slug_padding_size: 2
    },
    isSelected: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Tag', tagSchema)