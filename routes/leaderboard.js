const express = require('express')
const { getLeaderboardData } = require('../database/queries/leaderboard')
const { isValidDate, getAEST, getStartOfDayFromDate, getEndOfDayFromDate} = require('../utils/utils')
const leaderboardRouter = express.Router()

leaderboardRouter.post('/', async (req, res) => {
  let { day } = req.body

  if (!day) {
    return res.status(400).send('day is required')
  }

  day = getAEST(day)

  if (!isValidDate(day)) {
    return res.status(400).send(`invalid date ${day}`)
  }
  
  // Get the start and end of the day, and pass those in as the time range.
  const start = getStartOfDayFromDate(day)
  const end = getEndOfDayFromDate(day)

  let leaderboardData = await getLeaderboardData(start, end)
  // Calculate the percentages and strip the data we don't need.
  const leaderboardPercentages = leaderboardData.reduce((acc, entry) => {
    const exercisePercentage = calculateExercisePercentage(entry)
    if (!acc[entry.user_id]) {
      acc[entry.user_id] = {
        userId: entry.user_id,
        firstName: entry.first_name,
        lastName: entry.last_name,
        percentage: exercisePercentage,
      }
      return acc
    }
    acc[entry.user_id].percentage += exercisePercentage
    return acc
  }, {})
  res.json(leaderboardPercentages)
})

function calculateExercisePercentage(entry) {
  if (!entry.entry_amount || !entry.exercise_amount) {
    return 0
  }

  return (entry.entry_amount / entry.exercise_amount) / entry.totalExercises
}

module.exports = leaderboardRouter
