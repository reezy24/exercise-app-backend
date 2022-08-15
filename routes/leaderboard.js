const express = require('express')
const leaderboardRouter = express.Router()

// TODO: Join query select cols from tbl 1, tbl2, tbl3 where id1=id2 and id2=id3 etcc...

leaderboardRouter.get('/', (req, res) => {
    // Get the Users
    // Get their routine (they should only have one)    
    // Get the exercises
    // Get the entries for each exercise
    // Need to filter by the date range
    // Reduce to format:
    const mock = [
        {
            name: 'Zachary Reyes',
            percentage: 60
        }
    ]
})

module.exports = leaderboardRouter