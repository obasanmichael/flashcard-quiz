const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

import("node-fetch").then((nodeFetch) => {
  const fetch = nodeFetch.default;

  const app = express();
  const port = 3000;

  mongoose
    .connect(
      "mongodb+srv://obasantolu:obastolu2005@cluster0.nq4vrsl.mongodb.net/?retryWrites=true&w=majority"
    )
    .then(() => {
      console.log("database connected");
    });

  const questionSchema = new mongoose.Schema({
    question: String,
    correct_answer: String,
    incorrect_answers: [String],
  });

  const Question = mongoose.model("Question", questionSchema);

  app.use(bodyParser.json());

  app.get("/api/questions/:category", async (req, res) => {
    const { category } = req.params;
    const { amount, difficulty } = req.query;

    const allowedCategories = [
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
    ];
    if (!allowedCategories.includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category." });
    }

    try {
      const apiUrl = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      await Question.insertMany(data.results);

      res.json({ results: data.results });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error." });
    }
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"));
  });

  app.use(express.static("public"));

  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
});
