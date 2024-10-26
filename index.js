const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createIndexIfNotExists } = require("./services/elasticService");
const { fetchLogs } = require("./controllers/logController");
const setupLogSocket = require("./sockets/logSocket");

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  };
  
  app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

createIndexIfNotExists().catch(console.error);

app.get("/logs", fetchLogs);

setupLogSocket(io);

// Start server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
