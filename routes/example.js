const express = require('express')
const exampleRouter = express.Router()
const isLoggedIn = require('../middleware/isLoggedIn')

// Example of a protected route.
exampleRouter.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello, ${req.user.firstName} ${req.user.lastName}`)
})

// Test GET operation. 
exampleRouter.get("/ping", (_, res) => {
  res.send("pong");
});
  
// Test POST operation.
exampleRouter.post("/echo", (req, res) => {
  res.send(req.body);
});

module.exports = exampleRouter
