const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL);
let db = null;

async function getDatabase() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.DB_NAME);
  return db;
}

process.on("exit", async () => {
  if (db) {
    await client.close();
  }
});

module.exports = {
  getDatabase,
};
