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
    deletePet
} = require('../controllers/petController')

router
    .route('/')
    .get(getAllPets)
    .post([authenticateUser, imageConfig], createPet)

router
    .route('/:slug')
    .get(getSinglePet)
    .patch([authenticateUser], updatePet)
//other routes add authorize permission - add policy...

module.exports = router