const express = require('express')
const { createExercise } = require('../database/queries')
const exerciseRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')

// Create a new exercise.
exerciseRouter.post('/create', isLoggedIn, async (req, res) => {
  // Validate.
  let { routineId, name, amount, unit, order } = req.body
  if (!routineId) {
    res.status(400).send('routineId is required')
  }
  if (!name) {
    res.status(400).send('name is required')
  }
  if (!amount) {
    res.status(400).send('amount is required')
  }
  if (!order) {
    res.status(400).send('order is required')
  }
  if (!unit) {
    unit = 'reps'
  }
  // Create record.
  try {
    const ex = await createExercise(routineId, name, amount, unit, order)
    res.send(ex)
  } catch (e) {
    console.error(e)
    res.status(500).send('failed to create exercise')
  }
})

module.exports = exerciseRouter
