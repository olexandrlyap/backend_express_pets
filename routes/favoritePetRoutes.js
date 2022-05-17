const express = require('express')
const router = express.Router()

const {
    authenticateUser,
  } = require('../middleware/authentication');

const {
    getFavoritePets,
    createFavoritePet,
    deleteFavoritePet,
} = require('../controllers/favoritePetsController');
const { route } = require('./petRoutes');

router
    .route('/')
    .get([authenticateUser], getFavoritePets)

router
    .route('/:id')
    .post([authenticateUser], createFavoritePet)
    .delete([authenticateUser], deleteFavoritePet)

    module.exports = router
