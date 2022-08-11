const express = require('express')
const userRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')
const db = require("../database/connect")

// Lists all users.
// TODO: This was only intended as a test endpoint, we shouldn't just be returning all the rows.
userRouter.get('/list', async (_, res, next) => {
  try {
    const dbres = await db.query('select * from users')
    res.send(dbres.rows)
  } catch (err) {
    next(err)
  }
})

// Returns the current logged in user.
userRouter.get('/current', isLoggedIn, (req, res) => {
  res.json(req.user)
})

module.exports = userRouter
