const { Client } = require("@elastic/elasticsearch");
const { elasticsearchUrl, indexName } = require("../config");

const esClient = new Client({
  node: elasticsearchUrl
});

async function createIndexIfNotExists() {
  const exists = await esClient.indices.exists({ index: indexName });
  if (!exists.body) {
    await esClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            timestamp: { type: "date" },
            level: { type: "keyword" },  
            container_name: { type: "text" },
            log: { type: "text" },
          },
        },
      }
    });
  }
}

async function saveLog(logData) {
  try {
    await esClient.index({
      index: indexName,
      body: logData,
    });
  } catch (error) {
    console.error("Error saving log to Elasticsearch:", error);
  }
}

async function getLogs({ limit = 100, level, startTime, endTime, query }) {
  const body = {
    query: {
      bool: {
        must: [
          query ? { match: { log: query } } : { match_all: {} }, 
          level ? { match: { level } } : { match_all: {} },
          { range: { timestamp: { gte: startTime, lte: endTime } } }
        ]
      }
    },
    sort: [{ timestamp: { order: 'desc' } }],
    size: limit
  };

  try {
    const { body: result } = await esClient.search({
      index: indexName,
      body
    });
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error("Error in Elasticsearch query:", error);
    throw error;
  }
}

module.exports = { createIndexIfNotExists, saveLog, getLogs };
