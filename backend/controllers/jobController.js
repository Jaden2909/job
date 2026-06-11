const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const newJob = await Job.create(req.body);
    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
const Job = require('../models/Job'); // Adjust path based on your backend file layout

// Existing getJobs, createJob, applyJob, deleteJob logic...
// Ensure this new route controller function is present:

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { applicantId, status } = req.body;

    if (!applicantId || !status) {
      return res.status(400).json({ success: false, error: 'Missing applicantId or target status step.' });
    }

    // Find the target job posting
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job deployment entry not found.' });
    }

    // Locate the sub-document or element matching the applicant tracking loop
    const applicantIndex = job.applicants.findIndex(
      (app) => (app._id || app.id || app).toString() === applicantId.toString()
    );

    if (applicantIndex === -1) {
      // Fallback: If your applicants array contains direct ObjectIds instead of embedded schemas,
      // update the structure or handle it safely here. 
      // Assuming embedded object layout for handling status keys:
      return res.status(404).json({ success: false, error: 'Applicant record missing from listing pipeline.' });
    }

    // Set updated status tracking flag cleanly
    if (typeof job.applicants[applicantIndex] === 'object') {
      job.applicants[applicantIndex].status = status;
    } else {
      // Convert ID primitive string into detailed pipeline tracking object if necessary
      job.applicants[applicantIndex] = { _id: job.applicants[applicantIndex], status };
    }

    // Mark modifications for Mongoose array changes if using mixed type structures
    job.markModified('applicants');
    await job.save();

    return res.status(200).json({ success: true, message: 'Pipeline status saved to cluster database.', job });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
const Job = require('../models/Job'); // Adjust path based on your backend file layout

// Existing getJobs, createJob, applyJob, deleteJob logic...
// Ensure this new route controller function is present:

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { applicantId, status } = req.body;

    if (!applicantId || !status) {
      return res.status(400).json({ success: false, error: 'Missing applicantId or target status step.' });
    }

    // Find the target job posting
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job deployment entry not found.' });
    }

    // Locate the sub-document or element matching the applicant tracking loop
    const applicantIndex = job.applicants.findIndex(
      (app) => (app._id || app.id || app).toString() === applicantId.toString()
    );

    if (applicantIndex === -1) {
      // Fallback: If your applicants array contains direct ObjectIds instead of embedded schemas,
      // update the structure or handle it safely here. 
      // Assuming embedded object layout for handling status keys:
      return res.status(404).json({ success: false, error: 'Applicant record missing from listing pipeline.' });
    }

    // Set updated status tracking flag cleanly
    if (typeof job.applicants[applicantIndex] === 'object') {
      job.applicants[applicantIndex].status = status;
    } else {
      // Convert ID primitive string into detailed pipeline tracking object if necessary
      job.applicants[applicantIndex] = { _id: job.applicants[applicantIndex], status };
    }

    // Mark modifications for Mongoose array changes if using mixed type structures
    job.markModified('applicants');
    await job.save();

    return res.status(200).json({ success: true, message: 'Pipeline status saved to cluster database.', job });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
