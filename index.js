require("dotenv").config();
const passport = require('passport')
const express = require("express");
const session = require("express-session")
const cors = require("cors");
const path = require('path');
const port = process.env.PORT || 4000;

// Use middlewares.
const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    domain: process.env.COOKIE_DOMAIN,
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
app.use(express.static(path.resolve(__dirname, './frontend/build')));

// Sub routes.
// app.use('/', require("./routes/example"))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/exercises', require('./routes/exercises'))
app.use('/api/entries', require('./routes/entries'))
app.use('/api/leaderboard', require('./routes/leaderboard'))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
