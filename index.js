const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { saveLog, createIndexIfNotExists } = require("./services/elasticService");
const { fetchLogs } = require("./controllers/logController");
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'ngrok-skip-browser-warning',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers'
  ],
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

app.options('*', cors());

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.status(200).json({});
  }
  next();
});

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

app.get("/logs", fetchLogs);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: [
      "ngrok-skip-browser-warning",
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin"
    ],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

createIndexIfNotExists().catch(console.error);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});