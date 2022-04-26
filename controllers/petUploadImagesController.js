const multer  = require('multer')

const fileStorageEngine = multer.diskStorage({
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
]))

module.exports = {
    imageConfig
}
