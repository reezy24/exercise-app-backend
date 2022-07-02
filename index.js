require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get("/ping", (_, res) => {
  res.send("pongg");
});

app.post("/echo", (req, res) => {
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
