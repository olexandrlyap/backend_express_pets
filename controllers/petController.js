require('dotenv').config()
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const Tag = require('../models/Tag')
const { ObjectId } = require('mongodb');
const { checkAllowedBreeds } = require('../utils')
const { catBreeds, dogBreeds, otherBreeds } = require('../constants')


// TODO: DELETE IMAGE WHEN THEY ARE NOT USED -> SERVER, CLOUDINARY


const getAllPets = async (req, res) => {
    // add filter, sorting 
    const populateWithData = [{ path: 'tags', select: 'name slug _id'}, {path: 'user', select: '_id username'}]
    const pets = await Pet.find({}).populate(populateWithData)
    res.status(StatusCodes.OK).json({pets})
}

const getRecommendedPets = async (req, res) => {
    // for Main page and advertisments 
    const pets = await Pet.find({}).populate([{ path: 'tags', select: 'name slug _id'}, {path: 'user', select: '_id username'}]).limit(5)
    res.status(StatusCodes.OK).json({pets})
}

const removeDuplicateTags = (tags) => {
    const addedTags = new Set();
    const dedupedTags = [];
    for (const tag of tags) {
        if (!addedTags.has(tag.toString())) {
            dedupedTags.push(tag);
            addedTags.add(tag.toString());
        }
    }
    return dedupedTags;
}

const createPet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags, now_available, notes} = req.body
    const userID = req.user.userId
    const { mainImage, images } = req.files


    //check if not empty. If return
    if (!type || !breed || !contract || !name || !description || !age || !mainImage) {
        throw new CustomError.BadRequestError('Please add all information')
    }

    // check if breed is allowed
    checkAllowedBreeds({ type, breed, catBreeds, dogBreeds, otherBreeds })

    // check main_image size
    if (mainImage[0].size >= process.env.PET_MAIN_IMAGE_MAX_SIZE) {
        throw new CustomError.BadRequestError('Allowed capacity for main_image is 5mb')
    }

    // upload main_image to cloudinary
    // TODO: 
    // - DELETE FILES FROM SERVER AND CLOUDINARY(when not used)
    // - add IMAGES LATER AFTER THE MODEL IS CREATED? Due to validation of other fields.

    const uploadedMainImage = await cloudinary.uploader.upload(
        mainImage[0].path, 
        {
            use_filename: true,
            folder: 'pets'
        }
    )
    
    // validate images total size
    if(images) {
        const imagesSize = images.reduce((acc, image) => 
             acc += image.size
        , 0)
        if(imagesSize >= process.env.PET_IMAGES_MAX_SIZE) {
            throw new CustomError.BadRequestError('Maximum images capacity is 15mb')
        }
    }

    // get images path 
    const imagesLocalPaths = images.map((image) => image.path)

    // upload images to cloudinary and return links 
    const uploadImages = async () => {
        const images = imagesLocalPaths.map( async (path) => {
            const image = await cloudinary.uploader.upload(
                             path, 
                             {
                                 use_filename: true,
                                 folder: 'pets'
                             }
            )
            return image.secure_url
        })
        
        const result = await Promise.all(images)
        return result
    }

    const uploadedImages = await uploadImages()


    const limitedTags = tags ? removeDuplicateTags(tags.split(',').slice(0, 5)) : []
    // Create a Pet instance 
    const pet = await Pet.create({
        type,
        breed,
        contract,
        name,
        description,
        age,
        price,
        fees,
        now_available,
        notes,
        main_image: uploadedMainImage.secure_url,
        images: uploadedImages,
        user: ObjectId(userID),
        tags: limitedTags,
    })

    res.status(StatusCodes.CREATED).json({ pet })
}


const getSinglePet = async (req, res) => {
    const { slug } = req.params
    const pet = await Pet.findOne({ slug }).populate([ 
        {
            path: 'tags',
            select: 'name slug _id'
        },
        {
            path: 'user',
            select: '_id username'
        }
    ])
    if (!pet) {
        throw new CustomError.NotFoundError('Pet doesnt exist')
    }
    res.status(StatusCodes.OK).json({ pet })

}

const updatePet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags, notes, now_available } = req.body
    const { id } = req.params
    const userID = req.user.userId

    if (breed) {
        checkAllowedBreeds({ type, breed, catBreeds, dogBreeds, otherBreeds });
    }

    const pet = await Pet.findOneAndUpdate({ _id: id, user: userID }, {
        type,
        breed,
        contract,
        name,
        description,
        age,
        price,
        fees,
        notes,
        now_available,
        tags: tags && removeDuplicateTags(tags.slice(0, 5)),
    }, {
        new: true,
        populate: {
            path: 'tags',
            select: 'name slug _id'
        },
    });

    if (!pet) {
        throw new CustomError.UnauthorizedError('You have no permission')
    }

    // HANDLE IMAGES HERE.
    // WHAT LOGIC TO IMPLEMENT. SHOULD A USE UPLOAD EACH IMAGE IN UPDATE AGAIN? HOW TO PERSIST IMAGES. 

    res.status(StatusCodes.OK).json({})

}

const deletePet = async (req, res) => {
    const { id } = req.params
    const userID = req.user.userId

    const pet = await Pet.findOne({ _id: id, user: userID }).populate({
        path: 'tags',
        select: 'name slug _id'
    })

    if (!pet) {
        throw new CustomError.UnauthorizedError('You have no permission')
    }

    await pet.deleteOne()

    res.status(StatusCodes.OK).json({pet})

}


module.exports = {
    getAllPets,
    createPet,
    getSinglePet,
    updatePet,
    deletePet,
    getRecommendedPets,
}
