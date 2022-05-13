const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const User = require('../models/User')
const Review = require('../models/Review')
const { ObjectId } = require('mongodb')



const populateReviewsToUser = async (users) => {
    if(!users[0]) return
    const userIDs = []
    const userIndexesByID = {}
    const userCopy = []

    for (let i = 0; i < users.length; i++) {
        const { _id } = users[i]
        userIDs.push(_id)
        userIndexesByID[i] = _id
       // Object.assign(userIndexesByID, { [i]: _id })
        userCopy.push({...users[i].toJSON(), reviews: []})
    }

   // console.log(userIndexesByID)

    const reviews = await Review.find({ toUser: { $in: userIDs }})

  //  console.log(userCopy)
    for (const review of reviews) {
        for (const key in userIndexesByID) {
          if(userIndexesByID[key].toString() === review.toUser.toString()) {
              userCopy.forEach(user => {
                if(user._id.toString() ===  review.toUser.toString()) {
                    return user.reviews.push(review._id)
                }
              })
          }
            
        }
    }

    return userCopy

}

const getAllReviewsToUser = async (req, res) => {
    const { username } = req.params

   const user = await User.findOne({ username })

   const users = await User.find({})

   // for single user
  res.status(StatusCodes.OK).json({ reviews: await populateReviewsToUser([user]) })

   // for every user -> add new method and route
  // res.status(StatusCodes.OK).json({ reviews: await populateReviewsToUser( users) })
}

const getAllReviewsFromUser = async (req, res) => {
    const userID = req.user.userId

    const reviews = await Review.find({ fromUser: userID })

    if(!reviews?.length) {
        throw new CustomError.NotFoundError('You have not written any reviews yet')
    }

    res.status(StatusCodes.OK).json({ reviews })
   
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

/*   await user.updateOne({
      $push: {
          reviews: ObjectId(review._id)
      }
  }, { new: true })
 */

    res.status(StatusCodes.OK).json({ review, user })
}

/* const updateReview = async (req, res) => {
    console.log('update his reviews')
}
 */
const deleteReview = async (req, res) => {
    const userID = req.user.userId
    const { username, id } = req.params
    //username not necessary

    const review = await Review.findOneAndDelete({ fromUser: userID, _id: id })

 /*    const user = await User.findOneAndUpdate({ _id: review.toUser },
       {
        $pull: {
           reviews: ObjectId(review._id)
        }
    }, { new: true })
 */

    res.status(StatusCodes.OK).json({ review  })
}


module.exports = {
    getAllReviewsFromUser,
    getAllReviewsToUser,
    createReview,
    /* updateReview, */
    deleteReview
}