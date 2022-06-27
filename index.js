const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/ping', (_, res) => {
  res.send('pong')
})

app.post('/echo', (req, res) => {
  res.send(req.body)
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})