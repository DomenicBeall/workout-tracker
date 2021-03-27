const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

app.get("/exercise", (req, res) => {
    res.sendFile('./public/exercise.html', { root: __dirname });
});

app.get("/api/workouts", (req, res) => {
    // Send a json of all the workouts
    db.Workout.find().lean()
      .then(workouts => {
        res.json(workouts);
      })
      .catch(err => {
        res.json(err);
      });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
