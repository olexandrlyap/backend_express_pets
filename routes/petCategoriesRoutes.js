const express = require('express')
const router = express.Router()



const {
    authenticateUser,
    authorizePermissions,
  } = require('../middleware/authentication');

const {
    createCategories,
    getCategoryAge,
    getCategoryContracts,
    getCategoryTypes
} = require('../controllers/petCategoriesController')

router
    .route('/')
    .post([authenticateUser, authorizePermissions('admin')], createCategories)

router
    .route('/categoryAge')
    .get(getCategoryAge)

router
    .route('/categoryTypes')
    .get(getCategoryTypes)

router
    .route('/categoryContracts')
    .get(getCategoryContracts)


module.exports = router