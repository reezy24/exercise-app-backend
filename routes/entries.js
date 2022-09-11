const express = require('express')
const dayjs = require('dayjs')
const { 
  createEntry,
  listEntries,
  listEntriesOnDate,
  updateEntry,
  deleteEntry,
} = require('../database/queries/entries')
const entryRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')
// const { isValidDate } = require('../utils/utils')

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

// Batch get all entries for all exercises for current date.
entryRouter.post('/list-batch-daily', isLoggedIn, async (req, res) => {
  // Validate.
  const { exerciseIds, day } = req.body
  if (exerciseIds.length < 1) {
    return res.status(400).send('no exercise IDs submitted')
  }
  if (!day) {
    return res.status(400).send('day is required')
  }
  // TODO: NOT WORKING
  // if (!isValidDate(day)) {
  //   return res.status(400).send(`invalid date ${day}`)
  // }
  // Get the start and end of the day, and pass those in as the time range.
  const start = dayjs(day).startOf('day').toDate()
  const end = dayjs(day).endOf('day').toDate()

  let alEntries = {}
  // TODO: Make single call instead of for await loop
  for await (const id of exerciseIds) {
    // Validate.
    try {
      if (!id) {
        return res.status(400).send('id is required')
      }
      // Update record.
      const entries = await listEntriesOnDate(id, start, end)
      // TODO: Determine how to send the response back. Might need to send all the entries and map on FE
      // TODO: Might be able to show all the user's entries for that day if need?
      // alEntries = {
      //   ...alEntries,
      //   [id]: entries,
      // }
      alEntries = {
        ...alEntries,
        [id]: entries.reduce((prev, curr) => prev + curr.amount, 0)
      }
    } catch (e) {
      console.error(e)
      return res.status(500).send('failed to fetch entries')
    }
  }

  return res.send(alEntries)
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
