const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const Tag = require('../models/Tag')

const populatePets = async (tags) => {
    const tagIDs = []; // IDs for the query
    const tagIndexesByID = {}; // a way for us to quickly find a tag in the array by ID without looping
    for (let i = 0; i < tags.length; i++) {
        const { _id } = tags[i];
        tagIDs.push(_id);
        tagIndexesByID[_id] = i;
        tags[i].pets = [];
    }
    const pets = await Pet.find({ tags: { $in: tagIDs } });
    for (const pet of pets) {
        for (const tagID of pet.tags) {
            if (typeof tagIndexesByID[tagID] === 'number') {
                tags[tagIndexesByID[tagID]].pets.push(pet._id);
            }
        }
    }
}

const getAllTags = async (req, res) => {
    const tags = await Tag.find({})
    await populatePets(tags);
    res.status(StatusCodes.OK).json({ tags })
}

const createTag = async (req, res) => {
    const { name } = req.body
    if(!name) {
        throw new CustomError.BadRequestError('Name cant be empty')
    }

    const tag = await Tag.create({ name })

    if (!tag) {
        throw new CustomError.BadRequestError('Tag wasnt created')
    }

    res.status(StatusCodes.OK).json({tag})
}

const getSingleTag = async (req, res) => {
    const { id } = req.params

 
    const tag = await Tag.findById(id)
    await populatePets([tag]);

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}

const updateTag = async (req, res) => {
    const { id } = req.params
 
    const tag = await Tag.findById(id)

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}

const deleteTag = async (req, res) => {
    const { id } = req.params

    const tag = await Tag.findOne(id)

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    await tag.deleteOne()

    res.status(StatusCodes.OK).json({tag, deleteTagFromPet})
}




module.exports = {
    getAllTags,
    createTag,
    getSingleTag,
    updateTag,
    deleteTag
}