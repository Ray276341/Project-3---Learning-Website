const Users = require('../models/users');
const Progress = require('../models/course_progresses');
const Courses = require('../models/courses');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3'); 
const { s3Client, region } = require('../config/s3Config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' }); 

exports.registerUser = async (req, res) => {
    try {
        const { fullname, username, email, phoneNumber, password, role, avatar, create_at } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new Users({
            fullname,
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            avatar, 
            create_at
        });
        await user.save();
        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await Users.findOne({
            $or: [
                { username: identifier },
                { email: identifier },
                { phoneNumber: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác' });
        }

        // Tạo token JWT
        const token = jwt.sign({ 
            id: user._id, 
            username: user.username, 
            fullname: user.fullname, 
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: user.password,
            role: user.role,
            coursesJoined: user.coursesJoined,
            avatar: user.avatar,
            create_at: user.create_at
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Gửi token trong phản hồi
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi đăng nhập' });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' });
    }
};

exports.joinCourse = async (req, res) => {
    try {
        if (!req.body || req.body === undefined || req.body === '' || req.body === null) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin khóa học' });
        }
        const { courseId } = req.body;
        if (!courseId || courseId === undefined || courseId === '' || courseId === null) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin khóa học' });
        }   
        const course = await Courses.findById(courseId);

        if (course.price > 0) {
            return res.status(400).json({ success: false, message: 'Khóa học này cần phải thanh toán trước khi tham gia' });
        }

        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        if (user.coursesJoined.includes(courseId)) {
            return res.status(400).json({ success: false, message: 'Bạn đã tham gia khóa học này rồi' });
        }
        user.coursesJoined.push(courseId);
        await user.save();
        
        const progress = new Progress({
            userId: req.user.id,
            courseId
        });

        course.chapters.forEach(chapter => {
            progress.progress.push({
                chapter_order: chapter.order,
                lessons_completed: [],
                assignments_completed: []
            });
        });

        await progress.save();
        res.status(200).json({ success: true, message: 'Tham gia khóa học thành công' });
    } catch (error) {
        console.error('Lỗi khi tham gia khóa học:', error);
        res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tham gia khóa học' });
    }
};

exports.updateUserInfo = [
    upload.single('avatar'), 
    async (req, res) => {
        try {
            const { id } = req.user;
            const { fullname, username, email, phoneNumber, password } = req.body;
            const user = await Users.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            }

            if (fullname) user.fullname = fullname;
            if (username) user.username = username;
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }

            if (req.file) {
                const defaultAvatarUrl = 'https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/default-user-avatar.png';
                if (user.avatar && user.avatar !== defaultAvatarUrl && user.avatar.includes('amazonaws.com')) {
                    const oldKey = user.avatar.split('/').slice(-2).join('/');
                    const deleteParams = {
                        Bucket: 'learningwebsite-1',
                        Key: oldKey
                    };
                    const deleteCommand = new DeleteObjectCommand(deleteParams);
                    await s3Client.send(deleteCommand);
                }

                const timestamp = Date.now();
                const ext = path.extname(req.file.originalname);
                const filename = `user-avatar/${user._id}-${timestamp}${ext}`;

                const fileContent = fs.readFileSync(req.file.path);
                const params = {
                    Bucket: 'learningwebsite-1',
                    Key: filename,
                    Body: fileContent,
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(params);
                await s3Client.send(command);
                user.avatar = `https://${params.Bucket}.s3.${region}.amazonaws.com/${params.Key}`;

                fs.unlinkSync(req.file.path);
            }

            await user.save();
            res.status(200).json({ success: true, message: 'Cập nhật thông tin cá nhân thành công' });
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin cá nhân:', error);
            res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi cập nhật thông tin cá nhân' });
        }
    }
];