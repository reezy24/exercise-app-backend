const express = require('express')
const { getLeaderboardData, getExerciseCounts } = require('../database/queries')
const leaderboardRouter = express.Router()

leaderboardRouter.get('/', async (req, res) => {
  let leaderboardData = await getLeaderboardData()
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

module.exports = leaderboardRouter