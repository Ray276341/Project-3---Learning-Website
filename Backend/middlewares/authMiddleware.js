const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = req.header('Auth-Token');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không có token, quyền truy cập bị từ chối' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: "false", message: 'Token không hợp lệ' });
    }
};

module.exports = auth;