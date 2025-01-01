const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignments'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    submission_detail: {
        type: [{
            content: [String],
            testcases: {
                public: [{
                    input: String,
                    expected_output: String,
                    output: String,
                    status: String // correct | wrong 
                }],
                private: [{
                    status: String, // correct | wrong 
                    input: String,
                    your_output: String
                }]                
            },
            submit_at: {
                type: Date,
                default: Date.now
            },
            score: Number
        }]
    },
    highest_score: {
        type: Number
    },
    submit_count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Submissions', submissionSchema);