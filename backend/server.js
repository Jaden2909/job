const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const jobs = require('./routes/jobs');
const authRoutes = require('./routes/auth');

app.use('/api/jobs', jobs);
app.use('/api/auth', authRoutes);

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster0.o6z1v.mongodb.net/job_board?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
  .then(() => console.log('?? Connected smoothly to MongoDB Atlas Cluster'))
  .catch(err => console.error('Database Connection Error:', err));

const frontendBuildPath = path.join(__dirname, '../frontend/out');
app.use(express.static(frontendBuildPath));

app.get('/:slug*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`??? Backend Router Core spinning online on Port ${PORT}`));
