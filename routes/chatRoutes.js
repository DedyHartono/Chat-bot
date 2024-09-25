// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // Koneksi database

router.post("/save-session", async (req, res) => {
  const { sessionId, initialMessage, messages } = req.body;

  // Validasi untuk memastikan messages tidak null
  if (!messages) {
    return res.status(400).json({ error: "Messages cannot be null" });
  }

  console.log("Saving session data:", { sessionId, initialMessage, messages });

  const query = `
    INSERT INTO chat_records (session_id, initial_message, record, created_at)
    VALUES (?, ?, ?, NOW())
    `;

  try {
    await db.execute(query, [sessionId, initialMessage, messages]);
    res.status(200).json({ message: "Session saved successfully" });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ error: "Error saving session" });
  }
});

// Route untuk mengambil semua chat sessions dari database
router.get("/get-sessions", async (req, res) => {
  const query = "SELECT * FROM chat_records";

  try {
    // Execute the query using the connection pool
    const [rows] = await db.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    res.status(500).json({ error: "Error retrieving sessions" });
  }
});

module.exports = router;
