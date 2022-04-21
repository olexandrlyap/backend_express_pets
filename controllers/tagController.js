const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Tag = require('../models/Tag')


const getAllTags = async (req, res) => {
    const tags = await Tag.find({}).populate('pets')
    res.status(StatusCodes.OK).json({tags})
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
    const { slug } = req.params

    const tag = await Tag.findOne({ slug })

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}

const updateTag = async (req, res) => {

    res.send('update')
    const { slug, tagID } = req.body
 
    const tag = await Tag.findOne({ slug })

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}

const deleteTag = async (req, res) => {

    res.send('delete')
    const { slug, tagID } = req.body
 
    const tag = await Tag.findOne({ slug })

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}




module.exports = {
    getAllTags,
    createTag,
    getSingleTag,
    updateTag,
    deleteTag
}