const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    },
    progress: {
        type: [
            {
                chapter_order: Number,
                lessons_completed: [mongoose.Schema.Types.ObjectId],
                assignments_completed: [mongoose.Schema.Types.ObjectId],
                status: {
                    type: String,
                    enum: ['completed', 'in-progress', 'not-started'],
                    default: 'not-started'
                }
            }
        ],
        default: []
    },
    last_update: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CourseProgresses', courseProgressSchema);