const express = require('express')
const { createEntry, listEntries } = require('../database/queries')
const entryRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')

// REMINDER: use isLoggedIn when done testing.

// Create a new entry.
entryRouter.post('/create', async (req, res) => {
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
    const entry = await createEntry(exerciseId, amount)
    return res.send(entry)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to create entry')
  }
})

// List exercises by their routine. 
entryRouter.post('/list', async (req, res) => {
  // Validate.
  const { exerciseId } = req.body
  if (!exerciseId) {
    return res.status(400).send('exerciseId is required')
  }
  // Fetch records.
  try {
    const entries = await listEntries(exerciseId)
    if (entries.length <= 0) {
      return res.status(404).send('no entries found')
    }
    return res.send(entries)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to fetch entries')
  }
})

module.exports = entryRouter
