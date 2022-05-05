const express = require('express')
const router = express.Router()

const {
    authenticateUser,
  } = require('../middleware/authentication')

const {
    getProfiles,
    getSingleProfile,
    createProfile,
    updateProfile,
    deleteProfile
} = require('../controllers/profileController')


router
    .route('/')
    .post([authenticateUser], createProfile)

    // ??? add policies 
router  
    .route('/:userID')
    .patch([authenticateUser], updateProfile)
    .delete([authenticateUser], deleteProfile)


module.exports = router
    