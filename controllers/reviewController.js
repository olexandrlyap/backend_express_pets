const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const User = require('../models/User')
const Review = require('../models/Review')
const { ObjectId } = require('mongodb')

const populateReviewsToUsers = async (users) => {
    if(!users[0]) return []

    const userIDs = []
    const userIndexesByID = {}
    const usersCopy = []

    for (let i = 0; i < users.length; i++) {
        const { _id } = users[i]

        userIDs.push(_id)
        userIndexesByID[_id] = i

        const userWithReviews = { ...users[i].toJSON(), reviews: [] }
        usersCopy.push(userWithReviews)
    }

    const reviews = await Review.find({ toUser: { $in: userIDs }})

    for (const review of reviews) {
        const userID = review.toUser.toString()
        const userIndex = userIndexesByID[userID]
        const user = usersCopy[userIndex]
        user.reviews.push(review)
    }

    return usersCopy
}


const getAllReviewsToUser = async (req, res) => {
   const { username } = req.params

   const user = await User.findOne({ username })
   const reviews = await Review.find({ toUser: user.id })
   const numOfReviews = await Review.find({ toUser: user.id }).count()

   res.status(StatusCodes.OK).json({ reviews, numOfReviews })  
   

   // for single user
 // res.status(StatusCodes.OK).json({ reviews: await populateReviewsToUsers([user])[0] })

   // mulitple users
/*  const users = await User.find({})
 res.status(StatusCodes.OK).json({ reviews: await populateReviewsToUsers(users)}) */
}

const getAllReviewsFromUser = async (req, res) => {
    const userID = req.user.userId

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page- 1) * limit

    const reviews = await Review.find({ fromUser: userID }).skip(skip).limit(limit)
    const numOfReviews = await Review.find({ fromUser: userID }).count()

    if(!reviews?.length) {
        throw new CustomError.NotFoundError('You have not written any reviews yet')
    }

    res.status(StatusCodes.OK).json({ reviews, numOfReviews })
   
}

const createReview = async (req, res) => {
    const userID = req.user.userId
    const { username } = req.params
    const { comment, title, rating } = req.body


    if(!comment || !title || !rating) {
        throw new CustomError.BadRequestError('Please fill all fields')
    }

    const user = await User.findOne({ username })

    // check if user doesn't write reviews to his account.
    if(user._id.toString() === userID) {
        throw new CustomError.BadRequestError('You cant write reviews of yourself')
    }

    // check if user already have written a review
    const existingReview = await Review.findOne({ fromUser: userID, toUser: user._id })
    if(existingReview&&Object.keys(existingReview).length) {
        throw new CustomError.BadRequestError('You should update a review')
    }

    const review = await Review.create({
        comment,
        title, 
        rating,
        fromUser: ObjectId(userID),
        toUser: ObjectId(user._id)
    })

    res.status(StatusCodes.OK).json({ review, user })
}

/* const updateReview = async (req, res) => {
    console.log('update his reviews')
}
 */
const deleteReview = async (req, res) => {
    const userID = req.user.userId
    const { id } = req.params

    const review = await Review.findOneAndDelete({ fromUser: userID, _id: id })

    res.status(StatusCodes.OK).json({ review  })
}


module.exports = {
    getAllReviewsFromUser,
    getAllReviewsToUser,
    createReview,
    /* updateReview, */
    deleteReview
}