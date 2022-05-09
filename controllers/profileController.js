const User = require('../models/User')
const Profile = require('../models/Profile')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2;
const { bufferToDataURL } = require('../utils');
const { find } = require('../models/User');

const getProfiles = async (req, res) => {
    const profiles = await Profile.find({})

    res.status(StatusCodes.OK).json({ profiles })
}

const getSingleProfile = async (req, res) => {
    const { username } = req.params
    //instead of username -> id, depends on front

    const user = await User.findOne({ username }).select('_id')

    const profile = await Profile.findOne({ user: user._id })

    if(!profile) {
        throw new CustomError.NotFoundError('Profile not found')
    }

    res.status(StatusCodes.OK).json({ profile })

}

const createProfile = async (req, res) => {
    // create with register or at will
    const userID = req.user.userId
    const { about, public_email, public_number, website, facebook, twitter, instagram, location} = req.body
    const { mainImage, images } = req.files

    const existingProfile = await Profile.find({ user: userID })

    // check if user has profile
    if(existingProfile?.length) {
        throw new CustomError.BadRequestError('You allready have a profile')
    }
    // check allowed capacity for mainImage
    if (mainImage&&mainImage[0].size >= process.env.PROFILE_MAIN_IMAGE_MAX_SIZE) {
        throw new CustomError.BadRequestError('Allowed capacity for main_image is 5mb')
    }
    // upload mainImage
    const uploadedMainImage = await cloudinary.uploader.upload(
        bufferToDataURL(mainImage[0].buffer, mainImage[0].mimetype),
        { folder: 'users/profiles' }
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
    // upload images to cloudinary and return links 
    const uploadImages = async () => {
        const promises = images.map( async ({ buffer, mimetype }) => {
            const image = await cloudinary.uploader.upload(
                bufferToDataURL(buffer, mimetype), 
                { folder: 'users/profiles' }
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
    
    const profile = await Profile.create({
        about,
        public_email,
        public_number,
        website, 
        facebook,
        twitter,
        instagram,
        location,
        main_image: {
            id: uploadedMainImage.public_id,
            url: uploadedMainImage.url,
        },
        images: uploadedImages,
        user: ObjectId(userID)
        //location
    })

    // In User add a hook to change hasProfile boolean

    res.status(StatusCodes.CREATED).json({ profile })

}

const updateProfile = async (req, res) => {
    const userID = req.user.userId
    const { about, public_email, public_number, website, facebook, twitter, instagram, location} = req.body
    const { mainImage, images } = req.files

    // validate MainImage 
      if (mainImage&&mainImage[0].size >= process.env.PROFILE_MAIN_IMAGE_MAX_SIZE) {
        throw new CustomError.BadRequestError('Allowed capacity for main_image is 5mb')
    }
    let uploadedMainImage
    // check if mainImage exists. Upload to cloudinary
    if(mainImage) {
        uploadedMainImage = await cloudinary.uploader.upload(
            bufferToDataURL(mainImage[0].buffer, mainImage[0].mimetype),
            { folder: 'users/profiles' }
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
                    { folder: 'users/profiles' }
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

    const profile = await Profile.findOneAndUpdate({ user: userID }, {
        about,
        public_email,
        public_number,
        website, 
        facebook,
        twitter,
        instagram,
        location,
        main_image: {
            id: uploadedMainImage&&uploadedMainImage.public_id,
            url: uploadedMainImage&&uploadedMainImage.url 
        },
       images: uploadedImages&&uploadedImages,
        
    }, {
        new: true,
    })

    if(!profile) {
        throw new CustomError.BadRequestError('You are not authorized')
    }

    res.status(StatusCodes.OK).json({ profile })
}

const deleteProfile = async (req, res) => {
    const userID = req.user.userId

    const profile = await Profile.findOneAndDelete({ user: userID})

    const deleteImages = (profile) => {
        const allImages = [profile.main_image.id]
        for (const image of profile.images) {
            allImages.push(image.id);
        }
        return allImages
    }

    await cloudinary.api.delete_resources( deleteImages(profile))

    res.status(StatusCodes.OK).json({ profile })
}

module.exports = {
    getProfiles,
    getSingleProfile,
    createProfile,
    updateProfile,
    deleteProfile
}