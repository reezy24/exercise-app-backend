const db = require('./connect')
// TODO: Seperate this file by resource.

// Users.
async function findUserByUsername(username) {
  const res = await db.query(`
    SELECT
      id,
      username,
      first_name,
      last_name
    FROM users
    WHERE username=$1
  `, [username])
  return res.rows[0]
}

async function createUser(username, firstName, lastName) {
  const res = await db.query(`
    INSERT INTO users(username, first_name, last_name)
    VALUES($1, $2, $3)
    RETURNING id, username, first_name, last_name
  `, [username, firstName, lastName])
  if (!res.rows[0]) {
    throw new Error('expected a user to be created')
  }
  return res.rows[0]
}

// Routines. 
// Note: For MVP we probably won't support multiple routines.
async function createRoutine(ownerUserId, name) {
  const res = await db.query(`
    INSERT INTO routines (owner_user_id, name)
    VALUES ($1, $2)
    RETURNING id, created_at, owner_user_id, name
  `, [ownerUserId, name])
  if (!res.rows[0]) {
    throw new Error('expected a routine to be created')
  }
  return res.rows[0]
}

// Exercises.
async function createExercise(routineId, name, amount, unit, order) {
  const res = await db.query(`
    INSERT INTO exercises (routine_id, name, amount, unit, "order")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, routine_id, name, amount, unit, "order", created_at
  `, [routineId, name, amount, unit, order])
  if (!res.rows[0]) {
    throw new Error('expected a exercise to be created')
  }
  return res.rows[0]
}

async function listExercises(routineId) {
  const res = await db.query(`
    SELECT id, routine_id, name, amount, unit, "order", created_at
    FROM exercises
    WHERE routine_id=$1
  `, [routineId])
  return res.rows
}

async function getExercise(id) {
  const res = await db.query(`
    SELECT id, routine_id, name, amount, unit, "order", created_at
    FROM exercises
    WHERE id=$1
  `, [id])
  return res.rows[0]
}

// `updates` should be { column1Name: newValue1, column2Name: newValue2... }
// Also, I hate my life. Why is it so hard to write an update query?
async function updateExercise(id, updates) {
  const validUpdates = Object.keys(updates).reduce((acc, columnName) => {
    const newValue = updates[columnName]
    if (!newValue) {
      return acc
    }
    return { ...acc, [columnName]: newValue }
  }, {})
  const newValues = Object.values(validUpdates)
  const res = await db.query(`
    ${buildUpdateQueryBase('exercises', validUpdates)}
    WHERE id=$${newValues.length + 1}
    RETURNING id, routine_id, name, amount, unit, "order", created_at
  `, [...newValues, id])
  if (!res.rows[0]) {
    throw new Error('expected an exercise to be updated')
  }
  return res.rows[0]
}

async function deleteExercise(id) {
  const res = await db.query('DELETE FROM exercises WHERE id=$1', [id])
  return res.rowCount
}

// This function spits out something like...
// `UPDATE exercises SET name=$1, amount=$2`
// so that WHERE clauses can be appended after.
function buildUpdateQueryBase(tableName, updates) {
  const clauses = []
  let query = `UPDATE ${tableName} SET`
  let index = 0
  for (let columnName in updates) {
    let newValue = updates[columnName]
    if (!newValue) {
      continue
    }
    index++
    // Escape keywords.
    if (columnName === 'order') {
      columnName = '"order"'
    }
    clauses.push(`${columnName}=$${index}`)
  }
  return `${query} ${clauses.join(', ')}`
}

// Entries.
async function createEntry(exerciseId, amount, completedAt) {
  let columnNames = 'exercise_id, amount'
  let values = '$1, $2'
  let args = [exerciseId, amount]
  if (completedAt) {
    columnNames += ', completed_at'
    values += ', $3'
    args.push(completedAt)
  }
  const res = await db.query(`
    INSERT INTO entries (${columnNames})
    VALUES (${values})
    RETURNING id, exercise_id, amount, created_at, completed_at
  `, args)
  if (!res.rows[0]) {
    throw new Error('expected an entry to be created')
  }
  return res.rows[0]
}

async function listEntries(exerciseId) {
  const res = await db.query(`
    SELECT id, exercise_id, amount, created_at, completed_at
    FROM entries
    WHERE exercise_id=$1
  `, [exerciseId])
  return res.rows
}

async function updateEntry(id, amount) {
  // TODO: Support `created_at`.
  const res = await db.query(`
    UPDATE entries
    SET amount=$2
    WHERE id=$1
    RETURNING id, exercise_id, amount, created_at, completed_at
  `, [id, amount])
  if (!res.rows[0]) {
    throw new Error('expected an entry to be updated')
  }
  return res.rows[0]
}

async function deleteEntry(id) {
  const res = await db.query('DELETE FROM entries WHERE id=$1', [id])
  return res.rowCount
}

async function getLeaderboardData(fromDate, toDate) {
  // TODO: Implement from / to
  let { rows: leaderboardData } = await db.query(`
    SELECT
      u.id AS user_id,
      u.first_name,
      u.last_name,
      sum(en.amount) AS entry_amount,
      ex.id AS exercise_id,
      ex.amount AS exercise_amount
    FROM entries AS en
    INNER JOIN exercises AS ex
      ON en.exercise_id = ex.id
    INNER JOIN routines AS r 
      ON ex.routine_id = r.id
    INNER JOIN users AS u
      ON r.owner_user_id = u.id
    GROUP BY ex.id, u.id
  `)
  const exerciseCounts = await getExerciseCounts()
  // Append the exercise counts to the entries, as we need this to calculate the
  // final percentages.
  leaderboardData = leaderboardData.map((entry) => {
    const totalExercises = exerciseCounts.find(({ user_id }) => entry.user_id == user_id).total_exercises 
    return Object.assign(entry, { totalExercises })
  })
  return leaderboardData
}

async function getExerciseCounts() {
  const res = await db.query(`
    SELECT
      u.id AS user_id,
      COUNT(e.id) AS total_exercises
    FROM users AS u
    INNER JOIN routines AS r
      ON r.owner_user_id = u.id 
    INNER join exercises AS e
      ON e.routine_id = r.id
    GROUP BY u.id
  `)
  return res.rows
}

module.exports = {
  findUserByUsername,
  createUser,
  createRoutine,
  createExercise,
  listExercises,
  getExercise,
  updateExercise,
  deleteExercise,
  createEntry,
  listEntries,
  updateEntry,
  deleteEntry,
  getLeaderboardData,
  getExerciseCounts,
}
