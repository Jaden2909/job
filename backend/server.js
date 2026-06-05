const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.send('Server is live!');
});

const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Force cloud Atlas connection if the URI is available in your .env
    if (mongoUri) {
      console.log('Connecting directly to MongoDB Atlas Cloud...');
    } else if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
      console.log('Local Environment Detected: Initializing In-Memory DB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    } else {
      console.error('FATAL: No connection string found!');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('SUCCESS: Database connection initialized successfully!');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server blasting off on port ${PORT}`));
  } catch (error) {
    console.error('FATAL SERVER STARTUP ERROR:', error.message);
    process.exit(1);
  }
};

startServer();

