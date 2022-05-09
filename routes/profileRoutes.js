const express = require('express')
const router = express.Router()
const { imageConfig } = require('../controllers/profileUploadImagesController')

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
    .get(getProfiles)
    .post([authenticateUser, imageConfig], createProfile)
    .patch([authenticateUser, imageConfig], updateProfile)
    .delete([authenticateUser, imageConfig], deleteProfile)

    // ??? add policies 
router  
    .route('/:username')
    .get(getSingleProfile)
   // .patch([authenticateUser, imageConfig], updateProfile)
   // .delete([authenticateUser, imageConfig], deleteProfile)


module.exports = router
    