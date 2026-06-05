const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true 
  },
  companyName: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true 
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Job description is required'],
    trim: true 
  },
  jobType: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  tags: [{ 
    type: String 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
