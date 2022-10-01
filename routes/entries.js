const express = require('express')
const { 
  createEntry,
  listEntries,
  listEntriesPerExerciseOnDate,
  updateEntry,
  deleteEntry,
  listEntriesAllExercisesOnDate,
} = require('../database/queries/entries')
const entryRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')
const { getAEST, getStartOfDayFromDate, getEndOfDayFromDate } = require('../utils/utils')

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

  const day = new Date().toISOString();
  const createdAt = getAEST(day)
  const completedAt = createdAt
  console.log('createdAt', createdAt);
  console.log('completedAt', completedAt);

  // TODO: Support `completed_at` - date likely needs to be parsed to fit Postgres type.
  // Create record.
  try {
    const entry = await createEntry(exerciseId, amount, createdAt, completedAt)
    console.log(entry);
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
  let { exerciseIds, day } = req.body

  if (exerciseIds.length < 1) {
    return res.status(400).send('no exercise IDs submitted')
  }
  if (!day) {
    return res.status(400).send('day is required')
  }

  day = getAEST(day)

  // Get the start and end of the day, and pass those in as the time range.
  const start = getStartOfDayFromDate(day)
  const end = getEndOfDayFromDate(day)

  let allEntries = {}
  // TODO: Make single call instead of for await loop
  for await (const id of exerciseIds) {
    // Validate.
    try {
      if (!id) {
        return res.status(400).send('id is required')
      }
      // Update record.
      const entries = await listEntriesPerExerciseOnDate(id, start, end)
      // TODO: Determine how to send the response back. Might need to send all the entries and map on FE
      // TODO: Might be able to show all the user's entries for that day if need?
      // allEntries = {
      //   ...allEntries,
      //   [id]: entries,
      // }
      allEntries = {
        ...allEntries,
        [id]: entries.reduce((prev, curr) => prev + curr.amount, 0)
      }
    } catch (e) {
      console.error(e)
      return res.status(500).send('failed to fetch entries')
    }
  }

  console.log(allEntries);
  return res.send(allEntries)
})

// Batch get all entries for all exercises for current date.
// entryRouter.post('/list-batch-daily', isLoggedIn, async (req, res) => {
//   // Validate.
//   let { exerciseIds, day } = req.body
//   console.log('exerciseIds', exerciseIds);
// h 
//   if (exerciseIds.length < 1) {
//     return res.status(400).send('no exercise IDs submitted')
//   }

//   const stringOfExerciseIds = exerciseIds.join()

//   if (!day) {
//     return res.status(400).send('day is required')
//   }

//   day = getAEST(day)

//   // Get the start and end of the day, and pass those in as the time range.
//   const start = getStartOfDayFromDate(day)
//   const end = getEndOfDayFromDate(day)
 
//   try {
//     // Update record.
//     const entries = await listEntriesAllExercisesOnDate(stringOfExerciseIds, start, end)
//     console.log('entries', entries);
//     if (entries.length <= 0) {
//       return res.status(404).send('no entries found')
//     }
//     return res.send(entries)
//   } catch (e) {
//     console.error(e)
//     return res.status(500).send('failed to fetch entries')
//   }
// })

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
