require("dotenv").config();
const passport = require('passport')

const express = require("express");
const session = require("express-session")
const app = express();
app.use(session({ secret: process.env.SESSION_SECRET }))
app.use(passport.initialize())
app.use(passport.session())

const cors = require("cors");
const port = process.env.PORT || 4000;

const { Client } = require('pg')
const db = new Client(buildDBConnectionObj())

require('./auth')

db.connect()

function buildDBConnectionObj() {
  // Note: `DATABASE_URL` is the var name supplied by Heroku - do not change.
  let db_url = process.env.DATABASE_URL
  let ssl = false

  if (!db_url) {
    const db_host = process.env.POSTGRES_HOST || 'localhost'
    const db_port = process.env.POSTGRES_PORT || 5432
    const db_name = process.env.POSTGRES_DB_NAME || 'exercise-app'
    const db_user = process.env.POSTGRES_USER || 'postgres'
    const db_pass = process.env.POSTGRES_PASSWORD || 'postgres'

    db_url = `postgres://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`
  }

  if (process.env.POSTGRES_REQUIRE_SSL) {
    ssl = {
      rejectUnauthorized: Boolean(process.env.POSTGRES_REJECT_UNAUTHORIZED),
    }
  }

  return {
    connectionString: db_url,
    ssl,
  }
}

function isLoggedIn(req, res, next) {
  console.log(`---ASDFADSF`)
  console.log(req)
  console.log(`---ASDFADSF`)
  req.user ? next() : res.sendStatus(401)
}

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

app.get("/ping", (_, res) => {
  res.send("pongg");
});

app.post("/echo", (req, res) => {
  res.send(req.body);
});

app.get('/users', async (_, res, next) => {
  try {
    const dbres = await db.query('select * from users')
    res.send(dbres.rows)
  } catch (err) {
    next(err)
  }
})

// Example of a protected route.
app.get('/protected', isLoggedIn, (req, res) => {
  console.log(req)
  res.send(`hello, ${req.user.displayName}`)
})

// Example of a protected route (post).
app.post('/protected', isLoggedIn, (req, res) => {
  console.log(req)
  res.send(`hello, ${req.user.displayName}`)
})

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
app.get('/auth/failure', (req, res) => {
  res.send(`<div>Couldn't log you in. <a href="${process.env.FRONTEND_ORIGIN}">Back to home</a></div>`)
})

app.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/protected', //process.env.FRONTEND_ORIGIN,
    failureRedirect: '/auth/failure',
  })
)

app.get('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.send('Goodbye!')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
