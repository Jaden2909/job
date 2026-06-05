const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/jobs - Publicly accessible
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/jobs - Protected! Only Recruiters and Admins allowed
router.post('/', protect, authorize('Recruiter', 'Admin'), async (req, res) => {
  try {
    const { title, companyName, location, description, jobType, salaryRange, tags } = req.body;
    
    const newJob = await Job.create({
      title,
      companyName,
      location,
      description,
      jobType,
      salaryRange,
      tags
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
