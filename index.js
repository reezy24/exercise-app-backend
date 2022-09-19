require("dotenv").config();
const passport = require('passport')
const express = require("express");
const session = require("express-session")
const cors = require("cors");
const { getUser } = require("./database/queries/users");
const port = process.env.PORT || 4000;

// Use middlewares.
const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.USE_SECURE_SESSION,
  },
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_ORIGIN, ...(process.env.ALLOWED_ORIGINS || '').split(',')],
  credentials: true,
}));
// Temp middleware hack: assign `req.user` based on `req.body.userID`.
app.use(async (req, res, next) => {
  if (req?.body?.sessionUserID) {
    const user = await getUser(req.body.sessionUserID)
    req.user = user;
  }
  next()
})

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
