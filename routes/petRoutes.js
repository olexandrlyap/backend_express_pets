const express = require('express')
const router = express.Router()
const multer  = require('multer')
const CustomError = require('../errors')
const { imageConfig } = require('../controllers/petUploadImagesController')
/* const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads' )
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const multerFilter = (req, file, cb) => {

    console.log(file.mimetype)
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
        cb(null, true)
    } else {
        cb(new CustomError.BadRequestError('not an image'), false)
    }
}

const upload = multer({
    storage: fileStorageEngine,
    fileFilter: multerFilter,
    limits: {
        fileSize: 20000000 
    },
})

const imageConfig = upload.fields(([
   { name: 'main_image', maxCount: 1 },
   { name: 'images', maxCount: 5 }
])) */

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