const Courses = require('../models/courses');
const CourseProgresses = require('../models/course_progresses');
const Submissions = require('../models/submissions');

exports.getManagedCourses = async (req, res) => {
    try {
        const { role, id } = req.user;
        if (role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        const courses = await Courses.find({ instructor: id });
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách khóa học của giảng viên:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy danh sách khóa học của giảng viên' });
    }
}

exports.getStudentsOfCourse = async (req, res) => {
    try {
        const { role, id } = req.user;
        if (role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        const { courseId } = req.params;
        const course = await Courses.findById(courseId).populate('instructor');
        if (!course) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
        }
        if (!course.instructor || course.instructor._id.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        const studentsProgress = await CourseProgresses.find({ courseId }).populate('userId', 'name email');
        res.status(200).json({ success: true, studentsProgress });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách học viên của khóa học:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy danh sách học viên của khóa học' });
    }
};

exports.getAllSubmissionOfStudent = async (req, res) => {
    try {
        const { id, role } = req.user;
        if (role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        const { courseId, studentId } = req.params;
        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
        }
        if (course.instructor.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }
        const courseProgress = await CourseProgresses.findOne({ courseId, userId: studentId });
        if (!courseProgress) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tiến độ của học viên' });
        }

        const assignments = course.chapters.flatMap(chapter =>
            chapter.content.filter(content => content.assignment_id).map(content => content.assignment_id)
        );

        const submissions = await Promise.all(assignments.map(async (assignmentId) => {
            const submission = await Submissions.findOne({ assignmentId, userId: studentId }).sort({ created_at: -1 });
            return { assignmentId, submission };
        }));

        res.status(200).json({ success: true, submissions });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách assignment và submission của học viên:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy danh sách assignment và submission của học viên' });
    }
};

exports.getSubmissionDetail = async (req, res) => {
    try {
        const { id, role } = req.user;
        if (role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }

        const { submissionId } = req.params;
        const submission = await Submissions.findById(submissionId).populate('assignmentId');
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp của học viên' });
        }

        const assignment = submission.assignmentId;
        const course = await Courses.findById(assignment.course);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
        }

        if (course.instructor.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }

        res.status(200).json({ success: true, submission });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin chi tiết của submission của học viên:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thông tin chi tiết của submission của học viên' });
    }
}

exports.updateSubmissionScore = async (req, res) => {
    try {
        const { id, role } = req.user;
        if (role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }

        const { submissionId } = req.params;
        const { score } = req.body;

        const submission = await Submissions.findById(submissionId).populate('assignmentId');
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp của học viên' });
        }

        const assignment = submission.assignmentId;
        if (assignment.type !== 'plaintext' && assignment.type !== 'file-upload') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể cập nhật điểm cho bài nộp dạng plaintext hoặc file-upload' });
        }

        const course = await Courses.findById(assignment.course);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
        }

        if (course.instructor.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
        }

        if (!submission.highest_score || score > submission.highest_score) {
            submission.highest_score = score;
        }

        await submission.save();

        res.status(200).json({ success: true, submission });
    } catch (error) {
        console.error('Lỗi khi cập nhật điểm cho submission của học viên:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi cập nhật điểm cho submission của học viên' });
    }
};