const User = require('../models/User')
const Profile = require('../models/Profile')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

const getProfiles = async (req, res) => {
    res.send('get PRofiles')
}

const getSingleProfile = async (req, res) => {
    res.send('get one profile')
}

const createProfile = async (req, res) => {
    res.send('create profile')
}

const updateProfile = async (req, res) => {
    res.send('update profile')
}

const deleteProfile = async (req, res) => {
    res.send('delete one profile')
}

module.exports = {
    getProfiles,
    getSingleProfile,
    createProfile,
    updateProfile,
    deleteProfile
}