const { streamDockerLogs } = require("../services/dockerService");

function setupLogSocket(io) {
  io.on("connection", (socket) => {
    console.log("New WebSocket connection for log streaming");
    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });
  });

  streamDockerLogs(io);
}

module.exports = setupLogSocket;
