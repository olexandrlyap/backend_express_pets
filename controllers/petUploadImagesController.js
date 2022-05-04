require('dotenv').config()
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const CustomError = require('../errors');


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // MULTER WITHOUT CLOUDINARY
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads' )
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
}) 

const multerFilter = (req, file, cb) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
        cb(null, true)
    } else {
        cb(new CustomError.BadRequestError('not an image'), false)
    }
}

const upload = multer({
    storage,
    fileFilter: multerFilter,
    limits: {
        // limit main_image -> 5mb
        // limit images[] -> 15mb
        fileSize: process.env.PET_IMAGES_TOTAL_MAX_SIZE
    },
})

const imageConfig = upload.fields(([
   { name: 'mainImage', maxCount: 1 },
   { name: 'images', maxCount: 5 }
]))



module.exports = {
    imageConfig,

}
