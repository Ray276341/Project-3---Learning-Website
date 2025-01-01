const express = require('express'); 
const router = express.Router();
const userControllers = require('../controllers/userControllers.js');
const auth = require('../middlewares/authMiddleware.js');

router.post('/register', userControllers.registerUser);
router.post('/login', userControllers.loginUser);
router.get('/user-info', auth, userControllers.getUserInfo);
router.put('/join-course', auth, userControllers.joinCourse);
router.put('/update-user-info', auth, userControllers.updateUserInfo);

module.exports = router;