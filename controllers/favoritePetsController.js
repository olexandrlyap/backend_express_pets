
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const User = require('../models/User')
const FavoritePet = require('../models/FavoritePet')
const { ObjectId } = require('mongodb');

const getFavoritePets = async (req, res) => {
    const userID = req.user.userId

    const favoritePets = await FavoritePet.findOne({ user: userID}).populate('pets')
    //?limit, pagination
    //? what about naming favoritePets || favoritePet

    res.status(StatusCodes.CREATED).json({ favoritePets })
}

const createFavoritePet = async (req, res) => {

    // single user = one array of favorited Pets
    // create relationship with register a user

    const userID = req.user.userId

    const checkIfIsFavoriteCreated = await FavoritePet.findOne({ user: userID })

    if(checkIfIsFavoriteCreated&&Object.keys(checkIfIsFavoriteCreated).length) {
        throw new CustomError.BadRequestError('You allready have favorited created')
    }

    const favoritePet = await FavoritePet.create({
        user: ObjectId(userID)
    })

    res.status(StatusCodes.CREATED).json({ favoritePet })
}

const updateFavoritePets = async (req, res) => {
    const userID = req.user.userId
    const petID = req.params.id

    const checkIfIsFavorite = await FavoritePet.findOne({ user: userID })

    if( checkIfIsFavorite&&checkIfIsFavorite.pets.includes(petID) ) {
        throw new CustomError.BadRequestError('You allready have this pet favorited')
    }

    //?? add property in favoritePets -> isFavorited - if user has the pet favorited = true
    //?? add favoritePets to User?

    const favoritePet = await FavoritePet.findOneAndUpdate({ user: userID }, {
        $push: { pets: ObjectId(petID) }
    }, {
        new: true
    })

    res.status(StatusCodes.CREATED).json({ favoritePet })
}

const deleteFavoritePet = async (req, res) => {
    const userID = req.user.userId
    const petID = req.params.id

    const deletedFavoritedPet = await FavoritePet.findOneAndUpdate({ user: userID }, {
        $pull: { pets: ObjectId(petID) }
    }, {
        new: true
    })

    res.status(StatusCodes.CREATED).json({ favoritePet: deletedFavoritedPet })

}

module.exports = {
    getFavoritePets,
    createFavoritePet,
    updateFavoritePets,
    deleteFavoritePet,
}