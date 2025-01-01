const course_progresses = require('../models/course_progresses');
const Courses = require('../models/courses');
const Lessons = require('../models/lessons');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, region } = require('../config/s3Config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

exports.getAllLessons = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'admin' && role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem tất cả bài học' });
        }
        const lessons = await Lessons.find().select('-comments').sort({ create_at: 'desc' }).populate('course', 'course_title');
        console.log(lessons);
        res.status(200).json({ success: true, data: lessons });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.addLesson = [
    upload.single('document'),
    async (req, res) => {
        try {
            let { chapter_number, lesson } = req.body;
            const { role, id } = req.user;
            chapter_number = parseInt(chapter_number);

            const course = await Courses.findById(lesson.course);

            if (!course) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
            }

            if (role !== 'admin' && id !== course.instructor.toString()) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền thêm bài học' });
            }

            const newLesson = await Lessons.create(lesson);

            if (lesson.type === 'document' && req.file) {
                const timestamp = Date.now();
                const ext = path.extname(req.file.originalname);
                const filename = `lesson-document/${newLesson._id}-${timestamp}${ext}`;

                const fileContent = fs.readFileSync(req.file.path);
                const params = {
                    Bucket: 'learningwebsite-1',
                    Key: filename,
                    Body: fileContent,
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(params);
                await s3Client.send(command);
                newLesson.url = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`;

                await newLesson.save();

                fs.unlinkSync(req.file.path);
            }

            let chapter = course.chapters.find(chapter => chapter.order === chapter_number);
            if (!chapter) {
                if (chapter_number == course.chapters.length + 1 || chapter_number === course.chapters[course.chapters.length - 1].order + 1) {
                    course.chapters.push({
                        chapter_title: `Chương ${chapter_number}`,
                        order: chapter_number,
                        content: []
                    });
                    chapter = course.chapters[course.chapters.length - 1];

                    const progresses = await course_progresses.find({ courseId: course._id });
                    progresses.forEach(progress => {
                        progress.progress.push({
                            chapter_order: chapter_number,
                            lessons_completed: [],
                            assignments_completed: [],
                            status: 'not-started'
                        });
                        progress.save();
                    });
                }
                else return res.status(404).json({ success: false, message: 'Không tìm thấy chương, hãy tạo chương mới' });
            }

            chapter.content.push({
                content_type: 'lesson',
                lesson_id: newLesson._id.toString(),
                order: chapter.content.length + 1
            });

            await course.save();
            res.status(201).json({ success: true, data: newLesson, message: 'Thêm bài học thành công' });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
];

exports.getLesson = async (req, res) => {
    try {
        const { role, coursesJoined, id } = req.user;
        const { courseId, lessonId } = req.params;
        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }
        if (role !== 'admin' && id !== course.instructor.toString() && !coursesJoined.includes(courseId)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem bài học' });
        }
        const lesson = await Lessons.findById(lessonId).select('-comments').populate('course', 'course_title');
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }
        res.status(200).json({ success: true, data: lesson });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.getCommentsOfLesson = async (req, res) => {
    try {
        // const { role, coursesJoined, id } = req.user;
        const { lessonId } = req.params;
        const lesson = await Lessons.findById(lessonId).populate([
            { path: 'comments.userId', select: 'fullname avatar' },
            { path: 'comments.reply.userId', select: 'fullname avatar' }
        ]);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }
        // if (role !== 'admin' && id !== course.instructor.toString() && !coursesJoined.includes(courseId)) {
        //     return res.status(403).json({ success: false, message: 'Bạn không có quyền xem bình luận' });
        // }

        res.status(200).json({ success: true, data: lesson.comments });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.newComment = async (req, res) => {
    try {
        const { lessonId, content } = req.body;
        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }
        lesson.comments.push({
            userId: req.user.id,
            content,
            create_at: Date.now()
        });
        await lesson.save();
        res.status(201).json({ success: true, message: 'Thêm bình luận thành công' });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.replyComment = async (req, res) => {
    try {
        const { lessonId, commentId, content } = req.body;
        const lesson = await Lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
        }
        const comment = lesson.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }
        comment.reply.push({
            userId: req.user.id,
            content,
            create_at: Date.now()
        });
        await lesson.save();
        res.status(201).json({ success: true, message: 'Trả lời bình luận thành công' });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}