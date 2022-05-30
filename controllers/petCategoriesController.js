
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const PetCategoryAge = require('../models/PetCategoryAge')
const PetCategoryContract = require('../models/PetCategoryContract')
const PetCategoryType = require('../models/PetCategoryType')

const createCategories = async (req, res) => {
    const petCategoryAge = await PetCategoryAge.create({})
    const petCategoryContracts = await PetCategoryContract.create({})
    const petCategoryTypes = await PetCategoryType.create({}) 

    res.status(StatusCodes.CREATED).json({msg: 'success', petCategoryAge, petCategoryContracts, petCategoryTypes})
}

const getCategoryAge = async (req, res) => {
    const petCategoryAge = await PetCategoryAge.findOne({})

    res.status(StatusCodes.OK).json({ data:petCategoryAge })
}
const getCategoryContracts = async (req, res) => {
    const petCategoryContracts = await PetCategoryContract.findOne({})

    res.status(StatusCodes.OK).json({ data:petCategoryContracts })
}

const getCategoryTypes = async (req, res) => {
    const petCategoryTypes= await PetCategoryType.findOne({})

    res.status(StatusCodes.OK).json({ data:petCategoryTypes })
}

module.exports = {
    createCategories,
    getCategoryAge,
    getCategoryContracts,
    getCategoryTypes
}