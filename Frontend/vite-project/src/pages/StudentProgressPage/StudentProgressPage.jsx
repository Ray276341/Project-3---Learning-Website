import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { FaQuestionCircle, FaPenAlt, FaCode, FaFileAlt, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import './StudentProgressPage.css';

const StudentProgressPage = () => {
    const { courseId, userId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [grade, setGrade] = useState('');
    const [modalErrorMessage, setModalErrorMessage] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:3000/instructor/all-submission/${courseId}/${userId}`,
                    { headers: { 'Auth-Token': token } }
                );

                if (data.success) {
                    const submissions = data.submissions;
                    const detailedAssignments = await Promise.all(
                        submissions.map(async (submission) => {
                            try {
                                const { data: assignmentData } = await axios.get(
                                    `http://localhost:3000/assignment/get-assignment/${submission.assignmentId}`,
                                    { headers: { 'Auth-Token': token } }
                                );
                                const validTypes = ['plaintext', 'quiz', 'file-upload'];
                                if (!validTypes.includes(assignmentData.data.type)) {
                                    return null; // Skip this assignment if the type is not valid
                                }
                                return {
                                    id: submission.assignmentId,
                                    title: assignmentData.data.title,
                                    description: assignmentData.data.description && assignmentData.data.description || null,
                                    type: assignmentData.data.type,
                                    submission: submission.submission,
                                    status: submission.submission ? 'completed' : 'uncompleted',
                                };
                            } catch (error) {
                                console.error(`Error fetching assignment ${submission.assignmentId}:`, error);
                                return null; // Skip this assignment if fetching fails
                            }
                        })
                    );

                    // Filter out any null entries
                    setAssignments(detailedAssignments.filter((assignment) => assignment !== null));
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        };

        fetchSubmissions();
    }, [courseId, userId, token]);

    const getIcon = (type) => {
        switch (type) {
            case 'quiz':
                return <FaQuestionCircle />;
            case 'file-upload':
                return <FaFileAlt />;
            case 'plaintext':
                return <FaPenAlt />;
            default:
                return null;
        }
    };

    const openGradingModal = async (assignment) => {
        setErrorMessage(null); // Reset any previous error messages
        setModalErrorMessage(null); // Reset modal error messages
        setSelectedAssignment(assignment);
    
        if (!assignment.submission || !assignment.submission._id) {
            alert('Sinh viên chưa nộp bài');
            return;
        }
    
        try {
            const { data } = await axios.get(
                `http://localhost:3000/instructor/detail-submission/${assignment.submission._id}`,
                { headers: { 'Auth-Token': token } }
            );
    
            if (data.success) {
                const latestSubmission = data.submission.submission_detail[data.submission.submission_detail.length - 1];
    
                setSubmissionDetails({
                    question: data.submission.assignmentId.questions && data.submission.assignmentId.questions[0]?.question_content || null,
                    answerUrl: latestSubmission.content[0], // Assuming the first content is the desired URL
                });
    
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching submission details:', error);
        }
    };
    

    const handleConfirm = async () => {
        // Validate grade
        const parsedGrade = parseFloat(grade);
        if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
            setModalErrorMessage('Điểm phải là số từ 0 đến 10');
            return;
        }

        // Submit grade
        try {
            const { data } = await axios.put(
                `http://localhost:3000/instructor/score/${selectedAssignment.submission._id}`,
                { score: parsedGrade },
                { headers: { 'Auth-Token': token } }
            );

            if (data.success) {
                alert('Chấm điểm thành công!');
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                setModalErrorMessage('Lỗi khi chấm điểm. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error submitting grade:', error);
            setModalErrorMessage('Lỗi khi chấm điểm. Vui lòng thử lại.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedAssignment(null);
        setSubmissionDetails(null);
        setModalErrorMessage(null);
        setGrade('');
    };

    return (
        <div className="StudentProgressPage">
            <Navbar />
            <h1>Student Progress</h1>
            <div className="assignments-container">
                {assignments.map((assignment, index) => (
                    <div className={`assignment-item ${assignment.status}`} key={index}>
                        <span className="assignment-icon">{getIcon(assignment.type)}</span>
                        <span className="assignment-name">{assignment.title}</span>
                        {(assignment.type === 'file-upload' || assignment.type === 'plaintext') && (
                            <button
                                className="grade-button"
                                onClick={() => openGradingModal(assignment)}
                            >
                                Chấm điểm
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {showModal && selectedAssignment && submissionDetails && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Chấm điểm: {selectedAssignment.title}</h3>
                        <div className="modal-content">
                            {selectedAssignment.description && (
                                <>
                                    <h4>{selectedAssignment.description}</h4>
                                </>
                            )}
                            {submissionDetails.question && (
                                <>
                                    <label>Câu hỏi</label>
                                    <textarea readOnly value={submissionDetails.question} />
                                </>
                            )}
                            <label>Bài nộp</label>
                            <button
                                className="view-url-button"
                                onClick={() => window.open(submissionDetails.answerUrl, '_blank')}
                            >
                                URL bài nộp
                            </button>
                            <label>Nhập điểm</label>
                            <input
                                type="number"
                                placeholder="Enter score"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                            />
                            {modalErrorMessage && <div className="modal-error-message">{modalErrorMessage}</div>}
                            <button className="confirm-button" onClick={handleConfirm}>
                                Xác nhận
                            </button>
                            <button className="close-modal-button" onClick={closeModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgressPage;
