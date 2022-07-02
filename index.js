require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 4000;

const pgp = require('pg-promise')()
const db = pgp({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB_NAME || 'exercise-app',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
})

app.use(express.json());
app.use(cors());

app.get("/ping", (_, res) => {
  res.send("pongg");
});

app.post("/echo", (req, res) => {
  res.send(req.body);
});

app.get('/users', (req, res) => {
  db.any('select * from users')
    .then((data) => {
      res.send(data)
    })
    .catch((error) => {
      res.send(error)
    })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
