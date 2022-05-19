const catBreeds = require('./catBreeds')
const dogBreeds = require('./dogBreeds')
const otherBreeds = require('./otherBreeds')

const allowedTypes = [
    'kočka',
    'pes',
    'ostatní'
] 

const allowedContracts = [
    'darování',
    'krytí',
    'koupě',
    'útulek'
]

const checkAllowedBreedsQuery = (breed) => {
    const allowedBreeds = [
        ...catBreeds,
        ...dogBreeds,
        ...otherBreeds
    ]
   return allowedBreeds.includes(breed) 
}

module.exports = {
    allowedTypes,
    checkAllowedBreedsQuery,
    allowedContracts 
}