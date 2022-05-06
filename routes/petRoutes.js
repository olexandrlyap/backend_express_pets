const express = require('express')
const router = express.Router()
const { imageConfig } = require('../controllers/petUploadImagesController')


const {
    authenticateUser,
    authorizePermissions,
  } = require('../middleware/authentication');

const {
    getAllPets,
    createPet,
    getSinglePet,
    updatePet,
    deletePet,
    getRecommendedPets
} = require('../controllers/petController')

router
    .route('/')
    .get(getAllPets)
    .post([authenticateUser, imageConfig], createPet)

router
    .route('/:slug')
    .get(getSinglePet)

router
    .route('/:id')
    .patch([authenticateUser, imageConfig], updatePet)
    .delete([authenticateUser], deletePet)
//other routes add authorize permission - add policy...

router
    .route('/recommended/main')
    .get(getRecommendedPets)

module.exports = router