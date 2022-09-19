const express = require('express')
const userRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')
const { getUser, listUsers, updateUser } = require('../database/queries/users')

// Lists all users.
// TODO: This was only intended as a test endpoint, we shouldn't just be returning all the rows.
// TODO: Add authentication back in.
// userRouter.get('/list', isLoggedIn, async (req, res) => {
userRouter.get('/list', async (req, res) => {
  try {
    const users = await listUsers()
    if (users.length === 0) {
      return res.status(404).send('no users found')
    }
    return res.send(users)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to fetch users')
  }
})

// Returns the current logged in user.
userRouter.get('/current', isLoggedIn, (req, res) => {
  return res.json(req.user)
})

userRouter.post('/get', isLoggedIn, async (req, res) => {
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

userRouter.post('/update', isLoggedIn, async (req, res) => {
  // Validate.
  const { id, firstName, lastName } = req.body
  if (!id) {
    return res.status(400).send('id is required')
  }
  if (!firstName && !lastName) {
    return res.status(400).send('require at least one of firstName or lastName')
  }
  // Update record.
  try {
    const entry = await updateUser(id, { first_name: firstName, last_name: lastName })
    return res.send(entry)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to update entry')
  }
})

module.exports = userRouter
