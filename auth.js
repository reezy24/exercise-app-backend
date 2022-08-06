const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/google/callback",
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    // TODO: Create user in DB if it doesn't exist.
    console.log(request)
    console.log(accessToken)
    console.log(refreshToken)
    return done(null, profile);
  }
));

// What do these do?
passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})