const express = require('express'); 
const router = express.Router();
const instructorControllers = require('../controllers/instructorControllers.js');
const auth = require('../middlewares/authMiddleware.js');

router.get('/courses', auth, instructorControllers.getManagedCourses);
router.get('/students/:courseId', auth, instructorControllers.getStudentsOfCourse);
router.get('/all-submission/:courseId/:studentId', auth, instructorControllers.getAllSubmissionOfStudent);
router.get('/detail-submission/:submissionId', auth, instructorControllers.getSubmissionDetail);
router.put('/score/:submissionId', auth, instructorControllers.updateSubmissionScore);

module.exports = router;