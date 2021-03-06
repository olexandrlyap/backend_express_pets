
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const User = require('../models/User')
const FavoritePet = require('../models/FavoritePet')
const { ObjectId } = require('mongodb');

const getFavoritePets = async (req, res) => {
    const userID = req.user.userId

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page- 1) * limit

    const favoritePets = await FavoritePet.find({ user: userID })
        .populate('pet')
        .skip(skip)
        .limit(limit)

    res.status(StatusCodes.CREATED).json({ favoritePets, nbHits: favoritePets?.length })
}

const createFavoritePet = async (req, res) => {
    const userID = req.user.userId
    const petID = req.params.id

    const checkIfIsFavorite = await FavoritePet.findOne({ user: userID, pet: petID })

    if (checkIfIsFavorite&&Object.values(checkIfIsFavorite)) {
        throw new CustomError.BadRequestError('You already favorited this pet')
    }

    const favoritePet = await FavoritePet.create({
            pet: ObjectId(petID),
            user: ObjectId(userID)
        })
    

    res.status(StatusCodes.CREATED).json({ favoritePet  })
}

const deleteFavoritePet = async (req, res) => {
    const userID = req.user.userId
    const petID = req.params.id

    const deletedFavoritedPet = await FavoritePet.findOneAndDelete(
        { user: userID, pet: petID }, 
        { new: true }
        )

    res.status(StatusCodes.CREATED).json({ favoritePet: deletedFavoritedPet  })

}

module.exports = {
    getFavoritePets,
    createFavoritePet,
    deleteFavoritePet,
}

