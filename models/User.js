const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, 'Please provide name'],
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: Date,
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
  avatar: {
    type: String,
    maxlength: 1000,
    //add random selection between multiple avatars.
    default: 'https://res.cloudinary.com/de9rel1yu/image/upload/v1652103632/default_assets/36..04_pbbksy.jpg'
  },
  hasProfile: {
    type: Boolean,
    default: false
  },
  profile: {
    type: mongoose.Types.ObjectId,
    ref: 'Profile',
    default: {},
  },
  reviews: [{
    type: mongoose.Types.ObjectId,
    ref: 'Review',
    default: []
  }]
})

UserSchema.pre('save', async function () {
  if(this.isModified('username')) {
    this.username = this.username.replace(/\s+/g, '')
  }
  // console.log(this.modifiedPaths())
  // console.log(this.isModified('name'))
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
