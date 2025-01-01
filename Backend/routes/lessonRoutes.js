const express = require('express');
const router = express.Router();

const lessonControllers = require('../controllers/lessonControllers.js');
const auth = require('../middlewares/authMiddleware.js');

router.post('/add-lesson', auth, lessonControllers.addLesson);
router.get('/get-all-lessons', auth, lessonControllers.getAllLessons);
router.get('/get-lesson/:courseId/:lessonId', auth, lessonControllers.getLesson);
router.get('/get-comments-of-lesson/:lessonId', auth, lessonControllers.getCommentsOfLesson);
router.post('/new-comment', auth, lessonControllers.newComment);
router.post('/reply-comment', auth, lessonControllers.replyComment);

module.exports = router;