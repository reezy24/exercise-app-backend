const express = require('express')
const authRouter = express.Router()
const passport = require('passport')

require('../middleware/login-google')

// Log in with Google.
authRouter.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

// Page to redirect to if login fails.
authRouter.get('/failure', (req, res) => {
  return res.send(`<div>Couldn't log you in. <a href="${process.env.FRONTEND_ORIGIN}">Back to home</a></div>`)
})

// Callback when authenticating through Google.
authRouter.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: process.env.FRONTEND_ORIGIN,
    failureRedirect: '/auth/failure',
  })
)

// Log out the user.
authRouter.get('/logout', (req, res) => {
  return req.logout((err) => {
    if (err) {
      return next(err)
    }
    req.session.destroy()
    res.redirect('/auth/logged-out')
  })
})

authRouter.get('/logged-out', (req, res) => {
  return res.send(`
    <div>
      <p>You have logged out.</p>
      <a href="${process.env.FRONTEND_ORIGIN}">Back to home</a>
    </div>
  `)
})

module.exports = authRouter
