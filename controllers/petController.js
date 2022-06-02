require('dotenv').config()
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const Tag = require('../models/Tag')
const FavoritePet = require('../models/FavoritePet')
const { ObjectId } = require('mongodb');
const { checkAllowedBreeds, bufferToDataURL } = require('../utils')
const { catBreeds, dogBreeds, otherBreeds, allowedTypes, checkAllowedBreedsQuery, allowedContracts, allowedAge  } = require('../constants');


// TODO: DELETE IMAGE WHEN THEY ARE NOT USED -> SERVER, CLOUDINARY


const getAllPets = async (req, res) => {
    const userID = req.user?.userId ? req.user.userId  : null

    const { type, breed, contract, now_available, featured, age, skip, location, limit } = req.query


    const queryObject = {}
    if(type && allowedTypes.includes(type)) {
        queryObject.type = type
    }
    if(breed && checkAllowedBreeds(breed)) {
        queryObject.breed = breed
    }
    if(contract && allowedContracts.includes(contract)) {
        queryObject.contract = contract
    }
    if(now_available === 'true' || now_available === 'false') {
        queryObject.now_available = now_available
    }
    if(featured === 'true' || now_available === 'false') {
        queryObject.featured = featured
    }
    if(age && allowedAge.includes(age)) {
        queryObject.age = age
    }
    if (location) {
        const [lat, lng] = location.split(',');
        if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
            queryObject.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lat, lng],
                    },
                },
            };
        }
    }

    // get favoritePets of User
    const favoritePets = userID ? await FavoritePet.find({ user: userID }) : []
    const favoritePetIDs = new Set()
    for (const favoritePet of favoritePets) {
        favoritePetIDs.add(favoritePet.pet.toString())
    }

    // get pets
    const pets = await Pet.aggregate([
        ...(search ? [{
            $search: {
                index: 'default',
                phrase: {
                    query: search,
                    path: ['name', 'description', 'notes'],
                    // slop: 1,
                },
            },
        }] : []),
        { $match: queryObject },
        { $skip: skip ?? 0 },
        { $limit: Number(limit ?? 10) },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $lookup: {
                from: 'tags',
                localField: 'tags',
                foreignField: '_id',
                as: 'tags',
            },
        },
    ]);


    const petsWithFavorite = pets.map((pet) => {
        const [{ _id, username }] = pet.user;
        const tags = pet.tags.map(({ _id, slug, name }) => ({ _id, slug, name }));

        return {
            ...pet,
            user: { _id, username },
            tags,
            isFavorite: favoritePetIDs.has(pet._id.toString())
        }
    })

    res.status(StatusCodes.OK).json({ pets: petsWithFavorite })
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
    const { type, breed, contract, name, description, age, price, fees, tags, now_available, notes, location } = req.body
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
        bufferToDataURL(mainImage[0].buffer, mainImage[0].mimetype),
        { folder: 'pets' }
    )

    console.log('main', uploadedMainImage)

    
    // validate images total size
    if(images) {
        const imagesSize = images.reduce((acc, image) => 
             acc += image.size
        , 0)
        if(imagesSize >= process.env.PET_IMAGES_MAX_SIZE) {
            throw new CustomError.BadRequestError('Maximum images capacity is 15mb')
        }
    }

    // upload images to cloudinary and return links 
    const uploadImages = async () => {
        const promises = images.map( async ({ buffer, mimetype }) => {
            const image = await cloudinary.uploader.upload(
                bufferToDataURL(buffer, mimetype), 
                { folder: 'pets' }
            )
            return {
                id: image.public_id,
                url: image.secure_url,
            }
        })
        
        const result = await Promise.all(promises)
        return result
    }

    const uploadedImages = images ? await uploadImages() : []
    console.log('images', uploadedImages)


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
        main_image: {
            id: uploadedMainImage.public_id,
            url: uploadedMainImage.url,
        },
        images: uploadedImages,
        user: ObjectId(userID),
        tags: limitedTags,
        location: location && {
            type: 'Point',
            coordinates: location.split(','),
        }
    })

    console.log('pet', pet)


    res.status(StatusCodes.CREATED).json({ pet })
}


const getSinglePet = async (req, res) => {
    const { slug } = req.params
    const userID = req.user?.userId ? req.user.userId  : null

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

    const isPetFavorite = await  FavoritePet.exists({ user: userID, pet: pet._id })

    const petWithFavorite = {
        ...pet.toJSON(),
        isFavorite: isPetFavorite
    }

    res.status(StatusCodes.OK).json({ pet: petWithFavorite })

}

const updatePet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags, notes, now_available } = req.body
    const { id } = req.params
    const userID = req.user.userId
    const { mainImage, images } = req.files


    // Main image required
    // images optional
    // If MainImage || images not in req.files keep the original.
    // If MainImage || images delete old images and upload new.

    if (breed) {
        checkAllowedBreeds({ type, breed, catBreeds, dogBreeds, otherBreeds });
    }


    // validate MainImage 
    if (mainImage && mainImage[0].size >= process.env.PET_MAIN_IMAGE_MAX_SIZE) {
        throw new CustomError.BadRequestError('Allowed capacity for main_image is 5mb')
    }
    let uploadedMainImage
    // check if mainImage exists. Upload to cloudinary
    if(mainImage) {
        uploadedMainImage = await cloudinary.uploader.upload(
            bufferToDataURL(mainImage[0].buffer, mainImage[0].mimetype),
            { folder: 'pets' }
        )
    }

    let uploadImages

    if(images) {
        const imagesSize = images.reduce((acc, image) => 
             acc += image.size
        , 0)
        if(imagesSize >= process.env.PET_IMAGES_MAX_SIZE) {
            throw new CustomError.BadRequestError('Maximum images capacity is 15mb')
        }

         uploadImages = async () => {
            const promises = images.map( async ({ buffer, mimetype }) => {
                const image = await cloudinary.uploader.upload(
                    bufferToDataURL(buffer, mimetype), 
                    { folder: 'pets' }
                )
                return {
                    id: image.public_id,
                    url: image.secure_url,
                }
            })
            
            const result = await Promise.all(promises)
            return result
        }
    }

    const uploadedImages = images ? await uploadImages() : []

    
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
        main_image: {
            id: uploadedMainImage&&uploadedMainImage.public_id,
            url: uploadedMainImage&&uploadedMainImage.url ,
        }, 
        images: uploadedImages&&uploadedImages,
        
        tags: tags && removeDuplicateTags(tags.split(',').slice(0, 5)),
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

   
    res.status(StatusCodes.OK).json({ pet })

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

    const deleteImages = (pet) => {
        const allImages = [pet.main_image.id]
        for (const image of pet.images) {
            allImages.push(image.id);
        }
        return allImages
    }

    await cloudinary.api.delete_resources( deleteImages(pet))

    res.status(StatusCodes.OK).json({ pet })

}


module.exports = {
    getAllPets,
    createPet,
    getSinglePet,
    updatePet,
    deletePet,
}
