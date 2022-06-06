const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const sanitizeHtml = require('sanitize-html');

mongoose.plugin(slug)

const { Schema } = mongoose

const petSchema = new Schema({
    slug: {
        type: String,
        slug: ["name"],
        unique: true,
        slug_padding_size: 3
    },
    type: {
        type: String,
        required: [true, 'Type must be provided'],
        enum: ['kočka', 'pes', 'ostatní']
    },
    breed: {
        type: String,
        required: [false, 'breed must be provided'],
        maxLength: 30
    },
    contract: {
        type: String,
        required: [true, 'contract must be provided'],
        enum: ['koupě', 'útulek', 'darování', 'krytí'],
        default: 'koupě'
    },
    name: {
        type: String,
        required: [true, 'name must be provided'],
        minlength: 3,
        maxLength: 30,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'text must be provided'],
        minlength: 3,
        maxLength: 500,
        trim: true,
    },
    now_available: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        minlength: 3,
        maxlength: 30,
        trim: true
    },
    age: {
        type: String,
        required: [true, 'age must be provided'],
        enum: ['mládě', 'dospělý', 'senior']
    },
    main_image: {
        id: { type: String, required: [true, 'image must be provided'] },
        url: { type: String, required: [true, 'image must be provided'] },
    },
    images: [{
        id: { type: String, required: true },
        url: { type: String, required: true },
    }],
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        default: 0,
    },
    isAgreement: {
        type: Boolean,
        required: true,
        default: false,
    },
    fees: {
        type: Number,
        required: [false, 'Please provide fees'],
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tag',
    }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    location: {
        type: new Schema({ type: String, coordinates: [Number] }),
        required: false,
    },
},  { timestamps: true })

petSchema.index({ location: '2dsphere' });

const disallowHtmlOptions = {
    allowedTags: [],
    allowedAttributes: {},
};

petSchema.pre('save', function preSavePet(next) {
    if (this.slug) {
        this.slug = sanitizeHtml(this.slug, disallowHtmlOptions);
    }

    if (this.breed) {
        this.breed = sanitizeHtml(this.breed, disallowHtmlOptions)
    }

    if (this.name) {
        this.name = sanitizeHtml(this.name, disallowHtmlOptions);
    }

    if (this.notes) {
        this.notes = sanitizeHtml(this.notes, disallowHtmlOptions);
    }

    if (this.description) {
        this.description = sanitizeHtml(this.description);
    }

    next()
});

module.exports = mongoose.model('Pet', petSchema)