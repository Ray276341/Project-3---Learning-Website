const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
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
        type: String, //video/document
        required: true
    },
    url: {
        type: String
    },
    comments: {
        type: [
            {
                userId:  {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Users'
                },
                content: String,
                create_at: Date,
                reply: [
                    {
                        userId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Users'
                        },
                        content: String,
                        create_at: Date,
                    }
                ]
            }
        ],
        default: []
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lessons', lessonSchema);