const express = require('express');
const router = express.Router();

const submissionControllers = require('../controllers/submissionControllers.js');
const auth = require('../middlewares/authMiddleware.js');

router.post('/add-submission', auth, submissionControllers.addSubmission);
router.get('/get-submission/:assignmentId', auth, submissionControllers.getSubmission);

module.exports = router;