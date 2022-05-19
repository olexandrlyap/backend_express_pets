const catBreeds = require('./catBreeds')
const dogBreeds = require('./dogBreeds')
const otherBreeds = require('./otherBreeds')
const { allowedTypes, checkAllowedBreedsQuery, allowedContracts  } = require('./petQuery')

module.exports = {
    catBreeds,
    dogBreeds,
    otherBreeds,
    allowedTypes,
    checkAllowedBreedsQuery,
    allowedContracts 
}