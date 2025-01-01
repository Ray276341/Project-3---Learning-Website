const CourseProgresses = require('../models/course_progresses');
const Courses = require('../models/courses');

exports.getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { id } = req.user;

        const courseProgress = await CourseProgresses.findOne({ userId: id, courseId });

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: 'Course progress not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: courseProgress
        });

    }   catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const { id } = req.user;

        let courseProgress = await CourseProgresses.findOne({ userId: id, courseId });
        let courseOfLesson = await Courses.findById(courseId);

        if (!courseProgress) {
            courseProgress = await CourseProgresses.create({
                userId: id,
                courseId: courseId,
                progress: courseOfLesson.chapters.map(chapter => {
                    return {
                        chapter_id: chapter._id,
                        status: 'not-started',
                        lessons_completed: [],
                        assignments_completed: []
                    }
                })
            });
        }

        const chapter_order = courseOfLesson.chapters.find(chapter => chapter.content.find(content => content.lesson_id.toString() === lessonId.toString())).order;

        if (courseOfLesson.chapters[chapter_order - 1].content.find(content => content.lesson_id.toString() === lessonId.toString()) === undefined) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        //Tìm trong progress xem đã hoàn thành bài học chưa
        if (courseProgress.progress[chapter_order - 1].lessons_completed.includes(lessonId)) {
            return res.status(400).json({
                success: false,
                message: 'Lesson already completed'
            });
        }
        courseProgress.progress[chapter_order - 1].lessons_completed.push(lessonId);

        if (courseProgress.progress[chapter_order - 1].status === 'not-started') {
            courseProgress.progress[chapter_order - 1].status = 'in-progress';
        }

        if (    
            courseProgress.progress[chapter_order - 1].assignments_completed.length 
        +   
            courseProgress.progress[chapter_order - 1].lessons_completed.length 
        === courseOfLesson.chapters[chapter_order - 1].content.length
        ) 
        {
            courseProgress.progress[chapter_order - 1].status = 'completed';
        }

        await courseProgress.save();
        return res.status(200).json({
            success: true,
            message: 'Lesson completed'
        });

    }   catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}