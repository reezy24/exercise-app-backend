const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { findUserByUsername, createUser } = require("./database/queries");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/google/callback",
      passReqToCallback: true,
    },
    async function (_, _, _, profile, done) {
      try {
        let user = await findUserByUsername(profile.email);
        if (user) {
          return done(null, user);
        }
        // No existing user found, create them.
        return done(
          null,
          await createUser(
            profile.email,
            profile.given_name,
            profile.family_name
          )
        );
      } catch (e) {
        done(e, null);
      }
    }
  )
);

// Choose which parts of the user we want to store into the session.
passport.serializeUser(function (user, done) {
  done(null, {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
  });
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
