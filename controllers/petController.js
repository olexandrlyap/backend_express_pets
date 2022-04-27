require('dotenv').config()
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const Tag = require('../models/Tag')
const { ObjectId } = require('mongodb');
const { checkAllowedBreeds } = require('../utils')
const { catBreeds, dogBreeds, otherBreeds } = require('../constants')


// TODO

// ADD Tag only ONCE to Pet ???? Pre save hook?
// ADD Tag can have Pet once ???? Pre save hook?
// DELETE IMAGE WHEN THEY ARE NOT USED -> SERVER, CLOUDINARY


const getAllPets = async (req, res) => {
    // filter
    const pets = await Pet.find({}).populate('tags').select('-images')
    res.status(StatusCodes.OK).json({pets})
}

const createPet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags} = req.body
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
        main_image: mainImage.secure_url,
        images: uploadedImages,
        user: ObjectId(userID)
    })

    // Add tags to the Pet and limit max 5
    const limitedTags = tags ? tags.slice(0, 5) : null
    const petWithTags = await Pet.findByIdAndUpdate(pet._id, {
        $push: { tags: limitedTags }
    }, { new: true })

    // add Pet to Tags
    const petTags = await Tag.updateMany(
        { _id:  limitedTags   },
        { $push: { pets: petWithTags._id }}
    )


    res.status(StatusCodes.CREATED).json({ pet:petWithTags })
}


const getSinglePet = async (req, res) => {
    const { slug } = req.params
    const pet = await Pet.findOne({ slug }).populate({
        path: 'tags',
        select: 'name slug _id'
    })
    if (!pet) {
        throw new CustomError.NotFoundError('Pet doesnt exist')
    }
    res.status(StatusCodes.OK).json({ pet })

}

const updatePet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags} = req.body
    const { slug } = req.params
    const userID = req.user.userId


    const pet = await Pet.findOne({ slug, user: userID }).populate({
        path: 'tags',
        select: 'name slug _id'
    })

    if (!pet) {
        throw new CustomError.UnauthorizedError('You have no permission')
    }

    // HANDLE IMAGES HERE.
    // WHAT LOGIC TO IMPLEMENT. SHOULD A USE UPLOAD EACH IMAGE IN UPDATE AGAIN? HOW TO PERSIST IMAGES. 


    // refactor this:
    if(breed) {
         // check if breed is allowed
        checkAllowedBreeds({type, breed, catBreeds, dogBreeds, otherBreeds})
        pet.breed = breed
    }
    if(type) {
        pet.type = type
    }
    if(contract) {
        pet.contract = contract
    }
    if(name) {
        pet.name = name 
    }
    if(description) {
        pet.description = description
    }
    if(age) {
        pet.age = age
    }
    if(price) {
        pet.price = price
    }
    if(fees) {
        pet.fees = fees
    }

    // handle tags relationship
    const oldTags = pet.tags
    const limitedTags = tags ? tags.slice(0, 5) : null
    pet.tags = limitedTags

    await pet.save()

    // remove pet from old tags
    const removePetFromOldTags = await Tag.updateMany({ pets: {
        _id: pet._id
    }}, {
        $pull: { pets: pet._id }
    })

    // add pet to new tags
    const addPetToNewTags = await Tag.updateMany({ _id: limitedTags },
        {
            $push: { pets: pet._id }
        }
    )

    res.status(StatusCodes.OK).json({ removePetFromOldTags, addPetToNewTags })

}

const deletePet = async (req, res) => {
    res.send('delete pet')
}


module.exports = {
    getAllPets,
    createPet,
    getSinglePet,
    updatePet,
    deletePet
}


    // REFACTOR UPDATE BY IF() IN COMMENTED FASHION
/* 
    const updateFunction = async (model, attributes) => {
        for (let i = 0; i < attributes.length; i++) {
            for (const [key, value] of Object.entries(attributes[i])) {
                if(key && value) {
                  model.key = value
                  return model
                }
            }
        }
    } */
  /*   const petAttributes = [{ type }, { breed }, { contract }, { name }, { description }, { age }, { price }, { fees }]
    await updateFunction(pet,  petAttributes) */