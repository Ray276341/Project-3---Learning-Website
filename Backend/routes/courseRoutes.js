const express = require('express');
const router = express.Router();

const courseControllers = require('../controllers/courseControllers.js');
const auth = require('../middlewares/authMiddleware.js');

router.post('/all-courses', courseControllers.getCourses);
router.get('/my-courses', auth, courseControllers.getMyCourses);
router.get('/search-courses', courseControllers.searchCourses);
router.post('/find-by-instructor/', auth, courseControllers.findCourseByInstrutor);
router.get('/get-detail/:courseId', auth, courseControllers.getCourseDetail);
router.post('/add-course', auth, courseControllers.addCourse);
router.put('/update-course/:courseId', auth, courseControllers.updateCourse);
router.delete('/delete-course/:courseId', auth, courseControllers.deleteCourse);
router.post('/add-chapter/:courseId', auth, courseControllers.addChapter);
router.put('/update-chapter/:courseId/:chapterId', auth, courseControllers.updateChapter);
router.delete('/delete-chapter/:courseId/:chapterId', auth, courseControllers.deleteChapter);

module.exports = router;