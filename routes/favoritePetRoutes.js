const express = require('express')
const router = express.Router()

const {
    authenticateUser,
  } = require('../middleware/authentication');

const {
    getFavoritePets,
    createFavoritePet,
    deleteFavoritePet,
    updateFavoritePets
} = require('../controllers/favoritePetsController');
const { route } = require('./petRoutes');

router
    .route('/')
    .get([authenticateUser], getFavoritePets)
    .post([authenticateUser], createFavoritePet)

router
    .route('/:id')
    //.post([authenticateUser], createFavoritePet)
    .patch([authenticateUser], updateFavoritePets)
    .delete([authenticateUser], deleteFavoritePet)

    module.exports = router
