import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './ManageCourseStudentPage.css';

const ManageCourseStudentPage = () => {
    const { courseId } = useParams(); // Get the course ID from the URL
    const navigate = useNavigate();
    const [students, setStudents] = useState([]); // State to hold the list of students
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the Auth-Token from localStorage
                if (!token) throw new Error('Auth token is missing.');

                const response = await fetch(`http://localhost:3000/instructor/students/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth-Token': token,
                    },
                });

                const data = await response.json();

                if (!data.success) throw new Error('Failed to fetch students.');

                // Calculate progress for each student
                const studentsData = data.studentsProgress.map(student => {
                    const totalChapters = student.progress.length;
                    const completedChapters = student.progress.filter(chapter => chapter.status === 'completed').length;
                    const progressPercentage = Math.round((completedChapters / totalChapters) * 100);

                    return {
                        id: student.userId._id,
                        name: student.userId.name || 'Unknown', // Use "Unknown" if name is not provided
                        email: student.userId.email,
                        joinedDate: new Date(student.last_update).toLocaleDateString(),
                        progress: progressPercentage,
                        avatar: 'https://via.placeholder.com/80', // Placeholder for avatar
                    };
                });

                setStudents(studentsData);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchStudents();
    }, [courseId]);

    const handleStudentClick = (userId) => {
        navigate(`/student-progress/${courseId}/${userId}`);
    };

    return (
        <div className="ManageCourseStudentPage">
            <Navbar />
            <h1>Danh sách học viên</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="student-list">
                {students.map(student => (
                    <div
                        key={student.id}
                        className="student-item"
                        onClick={() => handleStudentClick(student.id)}
                    >
                        <div className="student-header">
                            <div className="student-info">
                                <div className="student-email">{student.email}</div>
                            </div>
                        </div>
                        <div className="student-progress-bar-container">
                            <div className="student-progress-text">{student.progress}%</div>
                            <div className="student-progress-bar">
                                <div
                                    className="student-progress"
                                    style={{ width: `${student.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="student-date">Ngày tham gia: {student.joinedDate}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageCourseStudentPage;
