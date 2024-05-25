import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome dear");
});

export default app;
