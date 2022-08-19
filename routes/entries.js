const express = require('express')
const { 
  createEntry,
  listEntries,
  updateEntry,
  deleteEntry,
} = require('../database/queries/entries')
const entryRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')

// Create a new entry.
entryRouter.post('/create', isLoggedIn, async (req, res) => {
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
entryRouter.post('/list', isLoggedIn, async (req, res) => {
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

entryRouter.post('/update', isLoggedIn, async (req, res) => {
  // Validate.
  const { id, amount } = req.body
  if (!id) {
    return res.status(400).send('id is required')
  }
  if (!amount) {
    return res.status(400).send('amount is required')
  }
  // Update record.
  try {
    const entry = await updateEntry(id, amount)
    return res.send(entry)
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to update entry')
  }
})

entryRouter.post('/delete', isLoggedIn, async (req, res) => {
  // Validate.
  const {id} = req.body
  if (!id) {
    return res.status(400).send('id is required')
  }
  // Delete record.
  try {
    const rowCount = await deleteEntry(id)
    if (rowCount === 0) {
      return res.status(400).send('entry not found')
    }
    return res.status(200).end()
  } catch (e) {
    console.error(e)
    return res.status(500).send('failed to delete entry')
  }
})

module.exports = entryRouter
