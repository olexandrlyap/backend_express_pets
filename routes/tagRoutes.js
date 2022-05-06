const express = require('express')
const router = express.Router()

const {
    authenticateUser,
    authorizePermissions,
  } = require('../middleware/authentication');

const {
    getAllTags,
    createTag,
    getSingleTag,
    updateTag,
    deleteTag
} = require('../controllers/tagController')

router
    .route('/')
    .get(getAllTags)
    .post([authenticateUser, authorizePermissions('admin')], createTag)

router
    .route('/:id')
    .get(getSingleTag)
    .patch([authenticateUser, authorizePermissions('admin')], updateTag)
    .delete([authenticateUser, authorizePermissions('admin')], deleteTag)

module.exports = router
