const express = require('express')
const router = express.Router()
const { imageConfig } = require('../controllers/petUploadImagesController')


const {
    authenticateUser,
    publicRouteAuthenticateUser,
} = require('../middleware/authentication');

const {
    getAllPets,
    createPet,
    getSinglePet,
    updatePet,
    deletePet,
} = require('../controllers/petController')

router
    .route('/')
    .get([publicRouteAuthenticateUser], getAllPets)
    .post([authenticateUser, imageConfig], createPet)

router
    .route('/:slug')
    .get([publicRouteAuthenticateUser], getSinglePet)

router
    .route('/:id')
    .patch([authenticateUser, imageConfig], updatePet)
    .delete([authenticateUser], deletePet)
//other routes add authorize permission - add policy...

module.exports = router