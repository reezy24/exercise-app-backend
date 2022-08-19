const dayjs = require('dayjs')
const express = require('express')
const { getLeaderboardData } = require('../database/queries/leaderboard')
const leaderboardRouter = express.Router()

leaderboardRouter.post('/', async (req, res) => {
  let { day } = req.body
  if (!day) {
    return res.status(400).send('day is required')
  }
  day = new Date(day)
  if (!isValidDate(day)) {
    return res.status(400).send(`invalid date ${day}`)
  }
  // Get the start and end of the day, and pass those in as the time range.
  const start = dayjs(day).startOf('day').toDate()
  const end = dayjs(day).endOf('day').toDate()
  console.log(start)
  console.log(end)
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
  return (entry.entry_amount / entry.exercise_amount) / entry.totalExercises
}

// https://stackoverflow.com/a/1353711
function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

module.exports = leaderboardRouter
