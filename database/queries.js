const db = require('./connect')

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

module.exports = {
  findUserByUsername,
  createUser,
}
