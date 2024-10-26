const { getLogs } = require("../services/elasticService");

async function fetchLogs(req, res) {
  const { limit = 100, level, startTime, endTime, query } = req.query;
  console.log('requesttttt')
  
  try {
    const logs = await getLogs({ limit: parseInt(limit), level, startTime, endTime, query });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}

module.exports = { fetchLogs };
