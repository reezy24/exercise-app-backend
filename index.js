require("dotenv").config();
const passport = require('passport')
const express = require("express");
const session = require("express-session")
const cors = require("cors");
// const { getUser } = require("./database/queries/users");
const port = process.env.PORT || 4000;

// Use middlewares.
const app = express();
app.use(passport.initialize())

app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_ORIGIN, ...(process.env.ALLOWED_ORIGINS || '').split(',')],
  credentials: true,
}));

app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: { 
  //   sameSite: "none",
  //   secure: process.env.USE_SECURE_SESSION,
  //   maxAge: 1000 * 60 * 60 * 24 * 7, // one week
  // },
}));

// app.use(session());
app.use(passport.initialize())
app.use(passport.session())

// Sub routes.
app.use('/', require("./routes/example"))
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/users'))
app.use('/exercises', require('./routes/exercises'))
app.use('/entries', require('./routes/entries'))
app.use('/leaderboard', require('./routes/leaderboard'))

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
