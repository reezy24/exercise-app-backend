const express = require('express')
const exerciseRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')
const db = require("../database/connect")

module.exports = exerciseRouter
