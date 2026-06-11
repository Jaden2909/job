const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs from cluster (Populates candidate details for dashboard triage)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .populate('applicants', 'name email'); // Resolves applicant IDs into names/emails dynamically
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error fetching listings' });
  }
});

// @route   POST /api/jobs
router.post('/', protect, authorize('Recruiter', 'Admin'), async (req, res) => {
  try {
    const jobData = { ...req.body, postedBy: req.user.id };
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/jobs/:id/apply
// @desc    Apply for a job slot (Null-safe for legacy cluster data structures)
router.put('/:id/apply', protect, authorize('Job-Seeker'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job profile not found' });
    }

    // Safety Guard: Initialize array if document was built prior to schema update
    if (!job.applicants) {
      job.applicants = [];
    }

    // Prevent double applications safely
    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'You have already applied to this position' });
    }

    job.applicants.push(req.user.id);
    await job.save();

    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Application system error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Remove a vacancy listing (Null-safe fallback for empty owner values)
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job profile not found' });
    }

    // Handle legacy documents missing a "postedBy" owner field safely
    const jobOwnerId = job.postedBy ? job.postedBy.toString() : null;

    if (jobOwnerId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this listing' });
    }

    await job.deleteOne();
    res.json({ success: true, message: 'Listing permanently purged from cluster' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Deletion execution failure' });
  }
});

module.exports = router;
