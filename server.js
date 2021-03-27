const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const db = require("./models");
const Workout = require("./models/Workout");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
);

app.get("/exercise", (req, res) => {
  res.sendFile('./public/exercise.html', { root: __dirname });
});

app.get("/stats", (req, res) => {
    res.sendFile('./public/stats.html', { root: __dirname });
});

app.get("/api/workouts", (req, res) => {
    // Send a json of all the workouts
    db.Workout.aggregate([{ $addFields: {
      totalDuration: { $sum: "$exercises.duration" }
    }}])
      .then(workouts => {
        res.json(workouts);
      })
      .catch(err => {
        res.json(err);
      });
});

app.get("/api/workouts/range", (req, res) => {
  db.Workout.find().sort([['day', -1]]).limit(7).lean()
      .then(workouts => {
        console.log(workouts);
        res.json(workouts);
      })
      .catch(err => {
        res.json(err);
      });
});

app.post("/api/workouts", (req, res) => {
  // Add new workout to workouts
  db.Workout.create(req.body)
    .then(workout => {
      res.json(workout);
    });
});

app.put("/api/workouts/:id", (req, res) => {
  const workoutID = req.params.id;
  const newExercise = req.body;

  db.Workout.findOneAndUpdate({_id: workoutID}, {$push : {exercises: newExercise}})
    .then(workout => {
      res.json(workout);
    });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
