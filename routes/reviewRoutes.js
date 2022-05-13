const express = require('express')
const router = express.Router()


const {
    authenticateUser,
  } = require('../middleware/authentication')

const {
   getAllReviewsFromUser,
   getAllReviewsToUser,
   createReview,
  /*  updateReview, */
   deleteReview
} = require('../controllers/reviewController')

router
    .route('/')
    .get([authenticateUser], getAllReviewsFromUser)

router
    .route('/:username')
    .get(getAllReviewsToUser)
    .post([authenticateUser], createReview)

router
    .route('/:username/:id')
   /*  .patch([authenticateUser], updateReview) */
    .delete([authenticateUser], deleteReview)

module.exports = router

