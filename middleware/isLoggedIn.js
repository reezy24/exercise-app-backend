function isLoggedIn(req, res, next) {
  console.log('hi')
  req.user ? next() : res.sendStatus(401)
}

module.exports = isLoggedIn
