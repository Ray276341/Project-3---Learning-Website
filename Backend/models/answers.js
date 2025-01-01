const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    answer_content: {
        type: [String]
    },
    language: {
        type: String
    },
    version: {
        type: String
    },
    pre_code: {
        type: String
    },
    // code mẫu
    next_code: {
        type: String
    },
    public_testcases: {
        type: [
            {
                input: String,
                expected_output: String
            }
        ]
    },
    private_testcases: {
        type: [
            {
                input: String,
                expected_output: String
            }
        ]
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

module.exports = mongoose.model('Answers', answerSchema);