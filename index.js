const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { saveLog, createIndexIfNotExists } = require("./services/elasticService");
const { fetchLogs } = require("./controllers/logController");

const app = express();
const PORT = 8080;

// Middleware to parse JSON request bodies
app.use(express.json());

// POST route to receive logs and emit them via socket
app.post("/log", async (req, res) => {
  try {
    const logData = req.body;
    const timestamp = new Date().toISOString();
    logData.timestamp = timestamp;

    console.log("Emitted:", logData);
    await saveLog(logData);
    io.emit("log_received", logData);

    res.status(200).json({ status: "success", message: "Log received" });
  } catch (error) {
    console.error("Invalid JSON received:", error);
    res.status(400).json({ status: "error", message: "Invalid JSON" });
  }
});

// GET route to fetch logs
app.get("/logs", fetchLogs);

// Create HTTP server and integrate it with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

// Ensure Elasticsearch index exists
createIndexIfNotExists().catch(console.error);

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
