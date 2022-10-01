const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const {
  findUserByUsername,
  createUser,
} = require("../database/queries/users");
const {
  createRoutine,
} = require("../database/queries/routines");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
},
  async function (_, _, profile, cb) {
    try {
      let user = await findUserByUsername(profile.emails[0].value);
      if (user) {
        return cb(null, user);
      }
      // No existing user found, create them.
      return cb(
        null,
        await handleSignup(
          profile.email,
          profile.given_name,
          profile.family_name
        )
      );
    } catch (e) {
      console.error(e)
      return cb(e, null);
    }
  }
));

// Choose which parts of the user we want to store into the session.
passport.serializeUser((user, done) => {
  return done(null, {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    routineId: user.routine_id,
  });
});

passport.deserializeUser((user, done) => {
  return done(null, user);
});

// Create the user and also a default routine for them to use.
async function handleSignup(email, firstName, lastName) {
  const user = await createUser(email, firstName, lastName)
  const routine = await createRoutine(user.id, `${firstName} ${lastName}'s Routine`)
  return { ...user, routine_id: routine.id }
}
