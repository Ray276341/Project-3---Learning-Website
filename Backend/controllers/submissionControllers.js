const Submissions = require('../models/submissions');
const Assignments = require('../models/assignments');
const Answers = require('../models/answers');
const Courses = require('../models/courses');
const CourseProgresses = require('../models/course_progresses.js');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, region } = require('../config/s3Config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const axios = require('axios');

function addChapterProgress(courseProgress, chapter_order) {
    let progress_num = courseProgress.progress.length;
    while (progress_num < chapter_order) {
        courseProgress.progress.push({
            chapter_order: progress_num,
            assignments_completed: [],
            status: 'in-progress'
        });
        progress_num++;
    }
    courseProgress.save();
}

function updateProgress(courseProgress, chapter_order, assignmentId, courseOfAssignment) {
    if (courseProgress.progress[chapter_order - 1].assignments_completed.indexOf(assignmentId) === -1) {
        courseProgress.progress[chapter_order - 1].assignments_completed.push(assignmentId);
    }
    if (courseProgress.progress[chapter_order - 1].status === 'not-started') {
        courseProgress.progress[chapter_order - 1].status = 'in-progress';
    }
    if (
        courseProgress.progress[chapter_order - 1].assignments_completed.length +
        courseProgress.progress[chapter_order - 1].lessons_completed.length ===
        courseOfAssignment.chapters[chapter_order - 1].content.length
    ) {
        courseProgress.progress[chapter_order - 1].status = 'completed';
    }
}

exports.addSubmission = async (req, res) => {
    try {
        const { id } = req.user;

        upload.fields([{ name: 'file', maxCount: 1 }, { name: 'assignmentId', maxCount: 1 }])(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }

            const { assignmentId, courseId } = req.body;

            const assignment = await Assignments.findById(assignmentId);
            const courseOfAssignment = await Courses.findById(courseId);
            let courseProgress = await CourseProgresses.findOne({ userId: id, courseId: courseId });
            if (!courseProgress) {
                courseProgress = await CourseProgresses.create({
                    userId: id,
                    courseId: courseId,
                    progress: courseOfAssignment.chapters.map(chapter => {
                        return {
                            chapter_id: chapter._id,
                            status: 'not-started',
                            lessons_completed: [],
                            assignments_completed: []
                        }
                    })
                });
            }
            let chapter_order = -1;

            for (const chapter of courseOfAssignment.chapters) {
                const hasAssignment = chapter.content.some(
                    content => content.assignment_id && content.assignment_id.toString() === assignmentId
                );
                if (hasAssignment) {
                    chapter_order = chapter.order; 
                    break;
                }
            }

            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập tương ứng' });
            }

            console.log("Type: " + assignment.type);

            if (assignment.type === 'quiz' || assignment.type === 'fill') {
                let resSubmission = {};
                const answers = await Answers.findById(assignment.answers);
                const { submission_content } = req.body;

                const existedSubmission = await Submissions.findOne({ assignmentId: assignmentId, userId: id });
                let score = 0;
                for (let i = 0; i < submission_content.length; i++) {
                    if (answers.answer_content[i].toLowerCase() === submission_content[i].toLowerCase()) {
                        score++;
                    }
                }

                let dec_score = (score / answers.answer_content.length) * 10.0;

                if (existedSubmission) {
                    if (existedSubmission.submit_count > 10) {
                        return res.status(400).json({ success: false, message: 'Bạn đã nộp bài quá 10 lần' });
                    }

                    existedSubmission.submit_count++;
                    existedSubmission.submission_detail.push({
                        content: submission_content,
                        score: dec_score
                    });

                    if (!existedSubmission.highest_score || dec_score > existedSubmission.highest_score) {
                        existedSubmission.highest_score = dec_score;
                    }

                    await existedSubmission.save();
                    resSubmission = existedSubmission;
                } else {
                    const newSubmission = await Submissions.create({
                        assignmentId,
                        userId: id,
                        submit_count: 1,
                        submission_detail: [{
                            content: submission_content,
                            score: dec_score
                        }],
                        highest_score: dec_score
                    });
                    await newSubmission.save();
                    resSubmission = newSubmission;
                }

                if (dec_score >= 7) {
                    addChapterProgress(courseProgress, chapter_order);
                    updateProgress(courseProgress, chapter_order, assignmentId, courseOfAssignment);
                }

                return res.status(200).json({ success: true, data: resSubmission });
            } else if (assignment.type === 'plaintext') {
                const { submission_content } = req.body;
                const existedSubmission = await Submissions.findOne({ assignmentId: assignmentId, userId: id });
                if (existedSubmission) {
                    if (existedSubmission.submit_count > 10) return res.status(400).json({ success: false, message: 'Bạn đã nộp bài quá 10 lần' });
                    existedSubmission.submit_count++;
                    existedSubmission.submission_detail.push({
                        content: submission_content
                    });
                    await existedSubmission.save();
                    addChapterProgress(courseProgress, chapter_order);
                    updateProgress(courseProgress, chapter_order, assignmentId, courseOfAssignment);
                    return res.status(200).json({ success: true, data: existedSubmission });
                } else {
                    const newSubmission = await Submissions.create({
                        assignmentId,
                        userId: id,
                        submit_count: 1,
                        submission_detail: [{
                            content: submission_content
                        }]
                    });
                    newSubmission.save();
                    return res.status(201).json({ success: true, data: newSubmission });
                }
            } else if (assignment.type === 'file-upload') {
                const file = req.files['file'][0];
                const fileContent = fs.readFileSync(file.path);
                const bucketName = 'learningwebsite-2';
                const folderName = `submission-upload/${id}`;

                const params = {
                    Bucket: bucketName,
                    Key: `${folderName}/${file.originalname}`,
                    Body: fileContent,
                    ContentType: file.mimetype
                };

                try {
                    await s3Client.send(new PutObjectCommand(params));
                    fs.unlinkSync(file.path); 

                    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${folderName}/${file.originalname}`;

                    const existedSubmission = await Submissions.findOne({ assignmentId, userId: id });

                    if (existedSubmission) {
                        if (existedSubmission.submit_count > 10) {
                            return res.status(400).json({ success: false, message: 'Bạn đã nộp bài quá 10 lần' });
                        }
                        existedSubmission.submit_count++;
                        existedSubmission.submission_detail.push({
                            content: fileUrl
                        });
                        await existedSubmission.save();
                        addChapterProgress(courseProgress, chapter_order);
                        updateProgress(courseProgress, chapter_order, assignmentId, courseOfAssignment);
                        return res.status(200).json({ success: true, data: existedSubmission });
                    } else {
                        const newSubmission = await Submissions.create({
                            assignmentId,
                            userId: id,
                            submit_count: 1,
                            submission_detail: [{
                                content: fileUrl
                            }]
                        });
                        await newSubmission.save();
                        addChapterProgress(courseProgress, chapter_order);
                        updateProgress(courseProgress, chapter_order, assignmentId, courseOfAssignment);
                        return res.status(201).json({ success: true, data: newSubmission });
                    }
                } catch (s3Error) {
                    return res.status(500).json({ success: false, message: s3Error.message });
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getSubmission = async (req, res) => {
    try {
        const { id } = req.user;
        const { assignmentId } = req.params;
        const submission = await Submissions
            .findOne({ assignmentId, userId: id })
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp tương ứng' });
        }
        else {
            return res.status(200).json({ success: true, data: submission });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
