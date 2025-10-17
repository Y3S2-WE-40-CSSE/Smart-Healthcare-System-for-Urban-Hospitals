const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Database helpers
const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
};

const disconnectTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

// Mock request/response helpers
const mockRequest = (data = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...data
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  mockRequest,
  mockResponse
};