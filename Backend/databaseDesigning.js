user = {
    _id: ObjectId,
    fullname: String,
    username: String,
    email: String,
    phone: String,
    password: String,
    role: String, // user/instructor/admin
    avatar: String, // link to image
    create_at: Date,
    update_at: Date
}

course = {
    _id: ObjectId,
    title: String,
    description: String,
    price: Number,
    instructor: ObjectId,
    "chapters": [
        {
            "chapter_title": String,
            "order": 1, // Số thứ tự chương
            "content": [
                {
                    "type": "lesson",
                    "lesson_id": ObjectId,
                    "order": 1 // Số thứ tự của bài học trong chương
                },
                {
                    "type": "assignment",
                    "assignment_id": ObjectId,
                    "order": 2 // Số thứ tự của bài tập trong chương
                }
            ]
        },
        {
            "chapter_title": String,
            "order": 2, // Số thứ tự chương
            "content": [
                {
                    "type": "lesson",
                    "lesson_id": ObjectId,
                    "order": 1
                },
                {
                    "type": "lesson",
                    "lesson_id": ObjectId,
                    "order": 2
                },
                {
                    "type": "assignment",
                    "assignment_id": ObjectId,
                    "order": 3
                }
            ]
        }
    ],
    students: [ObjectId],
    create_at: Date,
    update_at: Date
}

lesson = {
    _id: ObjectId,
    course: ObjectId,
    title: String,
    description: String,
    type: String, // video/document
    url: String,
    create_at: Date,
    update_at: Date,
    comments: [userId, content, create_at, reply[userId, content, create_at]]
} //lesson 1, lesson 2, lesson 3, lesson 4, lesson 5, lesson 6, lesson 7, lesson 8, lesson 9, lesson 10

assignment = {
    _id: ObjectId,
    course: ObjectId,
    title: String,
    description: String,
    type: String, // quiz/essay
    questions: [
        {
            "question_text": "MongoDB là gì?",
            "options": [
                "A. Cơ sở dữ liệu quan hệ",
                "B. Cơ sở dữ liệu NoSQL",
                "C. Hệ điều hành",
                "D. Ngôn ngữ lập trình"
            ],
        },
        {
            "question_text": "Mệnh đề nào dùng để tìm kiếm trong MongoDB?",
            "options": [
                "A. SELECT",
                "B. FIND",
                "C. QUERY",
                "D. GET"
            ],
        }
    ],
    url: String, //image
    duration: Number,
    answer: ObjectId,
    create_at: Date,
    update_at: Date
} // assignment 1, assignment 2, assignment 3, assignment 4, assignment 5, assignment 6, assignment 7, assignment 8, assignment 9, assignment 10

answer = {
    answer_content: {
        type: [String],
        required: true
    },
    language: {
        type: String
    },
    version: {
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
};

// enrollment = {
//     _id: ObjectId,
//     user: ObjectId,
//     course: ObjectId,
//     create_at: Date,
// }

submission = {
    _id: ObjectId,
    user: ObjectId,
    assignment_id: ObjectId,
    submission_content: [String],
    submit_at: Date,
    grade: Number,
    submit_count: Number
}

course_progress = {
    _id: ObjectId,
    user_id: ObjectId,
    course_id: ObjectId,
    progress: [
        {
            chapter_order:1,
            lessons_completed: [ // Mảng ID của các bài giảng đã hoàn thành
                ObjectId("807f1f77bcf86cd799439055"),
                ObjectId("807f1f77bcf86cd799439066")
            ],
            assignments_completed: [ // Mảng ID của các bài tập đã hoàn thành
                ObjectId("907f1f77bcf86cd799439066")
            ],
            status: "completed" // completed/ inprogress
        },
        {
            chapter_order:2,
            lessons_completed: [ // Mảng ID của các bài giảng đã hoàn thành
                ObjectId("807f1f77bcf86cd799439055"),
                ObjectId("807f1f77bcf86cd799439066")
            ],
            assignments_completed: [ // Mảng ID của các bài tập đã hoàn thành
                ObjectId("907f1f77bcf86cd799439066")
            ],
            status: "inprogress" // completed/ inprogress
        },
    ], // Tiến độ học tập
    create_at: Date,
    update_at: Date
}