const { exec } = require("child_process");
const { saveLog } = require("./elasticService");
const { dockerContainerName } = require("../config");

function streamDockerLogs(io) {
  const dockerProcess = exec(`sudo docker logs -f ${dockerContainerName}`);

  dockerProcess.stdout.on("data", async (data) => {
    const logLine = data.trim();
    if (logLine) {
      const logData = {
        timestamp: new Date().toISOString(),
        container_name: dockerContainerName,
        log: logLine,
      };
      console.log(logData)

      await saveLog(logData);
      io.emit("log", logData);
    }
  });

  dockerProcess.stderr.on("data", (data) => {
    console.error("Docker log streaming error:", data.toString());
  });

  dockerProcess.on("exit", (code) => {
    console.log(`Docker process exited with code ${code}`);
  });
}

module.exports = { streamDockerLogs };
