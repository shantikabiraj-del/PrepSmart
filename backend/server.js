require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());


// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shanti@098", // replace with your MySQL password
  database: "placement_prep"
});

db.connect((err) => {

  if(err){
    console.log(err);
  }

  else{
    console.log("MySQL Connected ✅");
  }

});


// Home Route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});


// Message Route
app.get("/message", (req, res) => {
  res.send("Hello from backend API");
});


// Login Route
app.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql =
  "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {

    if(err){

      console.log(err);

      res.json({
        success: false,
        message: "Server Error"
      });

    }

    else if(result.length > 0){

      res.json({
        success: true,
        message: "Login successful"
      });

    }

    else{

      res.json({
        success: false,
        message: "Invalid email or password"
      });

    }

  });

});
//register
app.post("/register", (req, res) => {

  const { name, email, password } = req.body;

  const sql =
  "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, password], (err, result) => {

    if(err){
      res.json({
        success: false,
        message: "Email already exists"
      });
    }

    else{
      res.json({
        success: true,
        message: "Registration successful"
      });
    }

  });

});


app.post("/save-resume", (req, res) => {
  const { name, email, skills, education } = req.body;

  const sql =
    "INSERT INTO resumes (name, email, skills, education) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, skills, education], (err, result) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        message: "Resume not saved"
      });
    } else {
      res.json({
        success: true,
        message: "Resume saved successfully"
      });
    }
  });
});
//quiz score
app.post("/save-score", (req, res) => {
  const { email, score, total } = req.body;

  const sql =
    "INSERT INTO quiz_scores (email, score, total) VALUES (?, ?, ?)";

  db.query(sql, [email, score, total], (err, result) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        message: "Score not saved"
      });
    } else {
      res.json({
        success: true,
        message: "Score saved successfully"
      });
    }
  });
});

//progress bar
app.get("/latest-score", (req, res) => {
  const sql = "SELECT * FROM quiz_scores ORDER BY id DESC LIMIT 1";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      res.json({
        success: true,
        data: result[0]
      });
    }
  });
});

//apptitude
app.get("/questions", (req, res) => {

  const sql = "SELECT * FROM aptitude_questions";

  db.query(sql, (err, result) => {

    if(err){

      console.log(err);

      res.json([]);

    }

    else{

      res.json(result);

    }

  });

});
app.get("/questions/:company", (req, res) => {
  const company = req.params.company;

  const sql = "SELECT * FROM aptitude_questions WHERE company = ?";

  db.query(sql, [company], (err, result) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(result);
    }
  });
});
//coding
app.get("/coding-questions/:company", (req, res) => {
  const company = req.params.company;

  const sql = "SELECT * FROM coding_questions WHERE company = ?";

  db.query(sql, [company], (err, result) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(result);
    }
  });
});
//coding score
app.post("/save-coding-score", (req, res) => {
  const { email, company, score, total } = req.body;

  const sql =
    "INSERT INTO coding_scores (email, company, score, total) VALUES (?, ?, ?, ?)";

  db.query(sql, [email, company, score, total], (err, result) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        message: "Coding score not saved"
      });
    } else {
      res.json({
        success: true,
        message: "Coding score saved successfully"
      });
    }
  });
});
app.get("/interview-questions/:company", (req, res) => {
  const company = req.params.company;

  const sql = "SELECT * FROM interview_questions WHERE company = ?";

  db.query(sql, [company], (err, result) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(result);
    }
  });
});
// ====== interview =====
app.post("/ai-interview-feedback", async (req, res) => {
  try {
    const { question, answer } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "You are an interview coach. Give short feedback with score out of 10, strengths, and improvements.\n\n" +
        "Question: " + question + "\n" +
        "Answer: " + answer
    });

    res.json({
      success: true,
      feedback: response.text
    });

  } catch (error) {
    console.log("Gemini Error:", error.message);

    res.json({
      success: false,
      feedback: "AI failed: " + error.message
    });
  }
});
//coding
app.post("/ai-coding-hint", async (req, res) => {
  try {
    const { question, code } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Give a helpful coding hint. Do not give the full final answer. Explain the approach in simple words.\n\n" +
        "Question: " + question + "\nUser Code: " + code
    });

    res.json({
      success: true,
      feedback: response.text
    });

  } catch (error) {
    res.json({
      success: false,
      feedback: "AI failed: " + error.message
    });
  }
});

//aptitude
app.post("/ai-aptitude-explain", async (req, res) => {
  try {
    const { question, options, selectedAnswer } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Explain this aptitude question in simple student-friendly language.\n\n" +
        "Question: " + question + "\nOptions: " + options +
        "\nSelected Answer: " + selectedAnswer
    });

    res.json({ success: true, feedback: response.text });

  } catch (error) {
    res.json({ success: false, feedback: "AI failed: " + error.message });
  }
});

//resume
app.post("/ai-resume-review", async (req, res) => {
  try {
    const { name, skills, education } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Review this student resume. Give score out of 100, strengths, missing points, and improvements.\n\n" +
        "Name: " + name +
        "\nSkills: " + skills +
        "\nEducation: " + education
    });

    res.json({ success: true, feedback: response.text });

  } catch (error) {
    res.json({ success: false, feedback: "AI failed: " + error.message });
  }
});
// mentor
app.post("/ai-career-mentor", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "You are a friendly placement career mentor for B.Tech CSE students. Give simple, practical, short guidance.\n\n" +
        "Student Question: " + message
    });

    res.json({
      success: true,
      reply: response.text
    });

  } catch (error) {
    res.json({
      success: false,
      reply: "AI failed: " + error.message
    });
  }
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});