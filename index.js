require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 4000;

const pgp = require('pg-promise')()
const db = pgp(buildDBConnectionObj())

function buildDBConnectionObj() {
  // Note: `DATABASE_URL` is the var name supplied by Heroku - do not change.
  let db_url = process.env.DATABASE_URL

  if (!db_url) {
    const db_host = process.env.POSTGRES_HOST || 'localhost'
    const db_port = process.env.POSTGRES_PORT || 5432
    const db_name = process.env.POSTGRES_DB_NAME || 'exercise-app'
    const db_user = process.env.POSTGRES_USER || 'postgres'
    const db_pass = process.env.POSTGRES_PASSWORD || 'postgres'

    db_url = `postgres://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`
  }

  return {
    connectionString: db_url,
    ssl: Boolean(process.env.POSTGRES_REQUIRE_SSL),
  }
}

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
