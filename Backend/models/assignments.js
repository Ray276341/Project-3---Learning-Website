const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Courses'
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        type: {
            type: String, // quiz/assignment/fill
            required: true
        },
        url: {
            type: String
        },
        questions: {
            type: [
                {
                    question_content: String,
                    options: [String]
                }
            ]
        },
        duration: {
            type: Number //seconds
        },
        answers: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Answers'
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model('Assignments', assignmentSchema);