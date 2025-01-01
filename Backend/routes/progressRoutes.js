const express = require('express');
const router = express.Router();
const progressControllers = require('../controllers/progressControllers');
const auth  = require('../middlewares/authMiddleware.js');

router.get('/get-course-progress/:courseId', auth, progressControllers.getCourseProgress);
router.put('/complete-lesson/:courseId/:lessonId', auth, progressControllers.completeLesson);

module.exports = router;