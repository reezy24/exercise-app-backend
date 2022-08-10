require("dotenv").config();
const passport = require('passport')
const express = require("express");
const session = require("express-session")
const cors = require("cors");
const port = process.env.PORT || 4000;

// Use middlewares.
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
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

// Sub routes.
app.use('/', require("./routes/example"))
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/users'))

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
