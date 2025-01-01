const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user' // user, instructor, admin
    },
    avatar: {
        type: String,
        default: 'https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/default-user-avatar.png'
    }, 
    coursesJoined: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Courses'
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

module.exports = mongoose.model('Users', userSchema);