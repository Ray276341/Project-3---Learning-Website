const express = require('express');
const router = express.Router();
const querystring = require('qs');
const moment = require('moment');
require('dotenv').config();

const Courses = require('../models/courses');
const Users = require('../models/users');
const Progress = require('../models/course_progresses');
const Auth = require('../middlewares/authMiddleware');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


router.post('/create_payment_url', Auth, async function (req, res) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const { courseId } = req.body;
    const { id } = req.user;

    const course = await Courses.findById(courseId).select('price');

    if (!course) {
        return res.status(400).json({ message: 'Course not found' });
    }

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        // req.connection.remoteAddress ||
        req.socket.remoteAddress 
        // req.connection.socket.remoteAddress;

    let tmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    let returnUrl = process.env.vnp_ReturnUrl;

    let orderId = moment(date).format('DDHHmmss');
    let amount = parseInt(course.price);
    let bankCode = "";

    let locale = "vn";
    if (locale === null || locale === '') {
        locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: JSON.stringify({ userId: id, orderId: orderId, courseId: courseId }),
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
    };

    if (bankCode !== null && bankCode !== '') {
        vnp_Params.vnp_BankCode = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);
    res.json({ vnpUrl });
});

router.post('/vnpay_return', async function (req, res) {
    let vnp_Params = req.query;
    
    const orderInfo = JSON.parse(vnp_Params['vnp_OrderInfo'] || '{}'); // Giải mã thông tin
    const userId = orderInfo.userId; // Thông tin userId
    const orderId = orderInfo.orderId; // Thông tin orderId
    const courseId = orderInfo.courseId; // Thông tin courseId
    const user = await Users.findById(userId);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if (secureHash.trim() === signed.trim()) {
        // Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        console.log('OK');
        const updatedUser = await Users.findOneAndUpdate(
            { _id: userId, coursesJoined: { $ne: courseId } },
            { $push: { coursesJoined: courseId } },
            { new: true }
        );

        if (updatedUser) {
            const course = await Courses.findById(courseId);
            const progressExists = await Progress.findOne({ userId, courseId });
            if (!progressExists) {
                const progress = new Progress({
                    userId,
                    courseId,
                    progress: course.chapters.map(chapter => ({
                        chapter_order: chapter.order,
                        lessons_completed: [],
                        assignments_completed: [],
                    })),
                });
                await progress.save();
            }
        }

        res.status(200).json({ message: 'OK', vnp_Params });
    } else {
        res.status(400).json({ message: 'Fail', vnp_Params });
    }
});

module.exports = router;