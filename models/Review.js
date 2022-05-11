const mongoose = require('mongoose');

const { Schema } = mongoose

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
      minlength: 15,
      maxlength: 500,
    },
    //from user
    fromUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    // to reviewed user || to profile? each user should have profile created by default
    toUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)


reviewSchema.index({  fromUser: 1, toUser: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)