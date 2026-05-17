/**
 * Global setup: spin up MongoMemoryServer SEKALI untuk semua test files.
 * URI ditulis ke process.env.MONGO_URI agar bisa dipakai mongoose.connect().
 */
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // mongodb-memory-server 11.x menggunakan create() dengan default modern binary
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  global.__MONGO__ = mongo;
  console.log('\n🧪 In-memory MongoDB started at', process.env.MONGO_URI);
};
