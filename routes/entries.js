const express = require('express')
const { createEntry } = require('../database/queries')
const entryRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')

// REMINDER: use isLoggedIn when done testing.

// Create a new entry.
entryRouter.post('/create', async (req, res) => {
console.log('asdf')
  // Validate.
  let { exerciseId, amount } = req.body
  if (!exerciseId) {
    return res.status(400).send('exerciseId is required')
  }
  if (!amount) {
    return res.status(400).send('amount is required')
  }
  // TODO: Support `completed_at` - date likely needs to be parsed to fit Postgres type.
  // Create record.
  try {
    const ex = await createEntry(exerciseId, amount)
    return res.send(ex)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to create entry')
  }
})

module.exports = entryRouter
