const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')


const checkAllowedBreeds = ({type, breed, catBreeds, dogBreeds, otherBreeds}) => {
    if(type === 'kočka') {
        if(!catBreeds.includes(breed)) {
            throw new CustomError.BadRequestError('not allowed cat breed')
        }
        return true
    }
    if(type === 'pes') {
        if(!dogBreeds.includes(breed)) {
            throw new CustomError.BadRequestError('not allowed dog breed')
        }
        return true
    }
    if(type === 'ostatní') {
        if(!otherBreeds.includes(breed)) {
            throw new CustomError.BadRequestError('not allowed other breed')
        }
        return true
    }

}

module.exports = checkAllowedBreeds