const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const db = require('./db')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/google/callback",
  passReqToCallback: true
},
  async function (_, _, _, profile, done) {
    try {
      let res = await db.query(`
        SELECT
          id,
          username,
          first_name,
          last_name
        FROM users
        WHERE username=$1
      `, [profile.email])
      if (res.rows[0]) {
        return done(null, res.rows[0])
      }
      // No existing user found, create them.
      res = await db.query(`
        INSERT INTO users(username, first_name, last_name)
        VALUES($1, $2, $3)
        RETURNING id, username, first_name, last_name
      `, [profile.email, profile.given_name, profile.family_name]) 
      if (!res.rows[0]) {
        throw new Error('expected a user to be created')
      }
      return done(null, res.rows[0])
    } catch (e) {
      done(e, null)
    }
  }
));

// Choose which parts of the profile we want to store into the session. 
// In this case, just the email and name.
// TODO: May want to store the user ID here as well.
passport.serializeUser(function (user, done) {
  done(null, {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
  })
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})