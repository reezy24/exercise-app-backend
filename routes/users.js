const express = require('express')
const userRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')
const db = require("../database/connect")
const { getUser } = require('../database/queries/users')

// Lists all users.
// TODO: This was only intended as a test endpoint, we shouldn't just be returning all the rows.
userRouter.get('/list', async (_, res, next) => {
  try {
    const dbres = await db.query('select * from users')
    return res.send(dbres.rows)
  } catch (err) {
    next(err)
  }
})

// Returns the current logged in user.
userRouter.get('/current', isLoggedIn, (req, res) => {
  return res.json(req.user)
})

userRouter.post('/get', async (req, res) => {
  // Validate.
  const { id } = req.body
  if (!id) {
    return res.status(400).send('id is required')
  }
  // Fetch record.
  try {
    const user = await getUser(id)
    if (!user) {
      return res.status(404).send('user not found')
    }
    return res.send(user)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to fetch user')
  }
})

module.exports = userRouter
