const express = require('express');
const router = express.Router();

const assignmentControllers = require('../controllers/assignmentControllers.js');
const auth = require('../middlewares/authMiddleware.js');

router.get('/get-all-assignments', auth, assignmentControllers.getAllAssignments);
router.post('/add-assignment', auth, assignmentControllers.addAssignment);
router.get('/get-assignment/:id', auth, assignmentControllers.getAssignmentById);

module.exports = router;