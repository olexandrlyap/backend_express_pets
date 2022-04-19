const Pet = require('../models/Pet')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')


const getAllPets = async (req, res) => {
    // filter
    const pets = await Pet.find({})
    res.status(StatusCodes.OK).json({pets})
}

const createPet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags} = req.body
    const userID = req.user.userId


    //check if not empty. If return
    // loop for if tags, breeds exists.

    const pet = await Pet.create({
        type,
        breed,
        contract,
        name,
        description,
        age,
        price,
        fees,
        tags,
        user: userID
    })

    res.status(StatusCodes.CREATED).json({pet})
    res.send('create')
}

const getSinglePet = async (req, res) => {
    res.send('single pet')
}

const updatePet = async (req, res) => {
    res.send('supdate pet')
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