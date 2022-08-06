require("dotenv").config();
const passport = require('passport')

const express = require("express");
const session = require("express-session")
const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // TODO: Configure `secure` value based on env - should be true for deployed versions i.e. over HTTPS connections. 
  // secure: true
}))
app.use(passport.initialize())
app.use(passport.session())

const cors = require("cors");
const port = process.env.PORT || 4000;

require('./auth')

const db = require("./database/connect")

function isLoggedIn(req, res, next) {
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

app.get('/current-user', isLoggedIn, (req, res) => {
  res.json(req.user)
})

// Example of a protected route.
app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello, ${req.user.firstName} ${req.user.lastName}`)
})

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
app.get('/auth/failure', (req, res) => {
  res.send(`<div>Couldn't log you in. <a href="${process.env.FRONTEND_ORIGIN}">Back to home</a></div>`)
})

app.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: process.env.FRONTEND_ORIGIN,
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
