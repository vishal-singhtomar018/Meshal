if (process.env.NODE_ENV !== "production") {
  (async () => {
    const dotenv = await import("dotenv");
    dotenv.config();
  })();
}

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
app.use(express.json()); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));  

const genAI = new GoogleGenerativeAI("AIzaSyAUdGxzIDLzJEdbm6gVKTJbLjuLJGf-_WY");

// Store chat history in memory (simple version)
let chatHistory = [];

// Render main page
app.get("/", (req, res) => {
  res.render("Dream", { chatHistory});
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  chatHistory.push({ role: "user", text: userMessage });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: process.env.Instruction,
    });

    const result = await model.generateContent(userMessage);
    const botReply = result.response.text();

    chatHistory.push({ role: "bot", text: botReply });

    // ✅ Send JSON instead of redirect
    res.json({ reply: botReply });
  } catch (err) {
    console.error("Error:", err);
    chatHistory.push({ role: "bot", text: "Oops! Kuch error aa gaya 😕" });

    // ✅ Send JSON error message too
    res.json({ reply: "Oops! Kuch error aa gaya 😕" });
  }
});


// Clear chat (also return JSON)
app.post("/clear", (req, res) => {
  chatHistory = []; // reset chat history
  res.redirect("/");
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
