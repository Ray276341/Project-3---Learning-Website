import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import QuizForm from '../../components/QuizForm/QuizForm';

const QuizAssignment = () => {
    const { courseId, assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [assignmentState, setAssignmentState] = useState(null);
    const [highestScore, setHighestScore] = useState(null);
    const [answers, setAnswers] = useState([]);
    const location = useLocation();
    const dataState = location.state;
    const token = localStorage.getItem('token');
    const { chapterIndex, itemIndex } = dataState;

    const fetchAssignment = async (assignmentId) => { 
        try {
            const response = await axios.get(`http://localhost:3000/assignment/get-assignment/${assignmentId}`,
                {
                    method: 'GET',
                    headers: {
                        'Auth-Token': `${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            if (response.data.success) {
                setAssignment(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching assignment:', error);
        }
    };
    const fetchAssignmentState = async (courseId, assignmentId) => {
        try {
            const response = await axios.get(`http://localhost:3000/progress/get-course-progress/${courseId}`,
            {
                headers: {
                    'Auth-Token': `${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (response.data.success) {
                const progress = response.data.data;
                if (progress.progress[parseInt(dataState.chapterIndex)].assignments_completed.includes(assignmentId)) {
                    setAssignmentState('Đã hoàn thành');
                } else {
                    setAssignmentState('Chưa hoàn thành');
                }
            }
        } catch (error) {
            console.error('Error fetching course progress:', error);
            setAssignmentState('Chưa hoàn thành');
        }
    };
    const fetchHighestScore = async (assignmentId) => {
        try {
            const response = await axios.get(`http://localhost:3000/submission/get-submission/${assignmentId}`,
            {
                headers: {
                    'Auth-Token': `${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (response.data.success) {
                setHighestScore(response.data.data.highest_score);
            }
            else setHighestScore(0);
        } catch (error) {
            console.error('Error fetching highest score:', error);
            setHighestScore(0);
        }
    };
    useEffect(() => {
        fetchAssignment(assignmentId);
        fetchAssignmentState(courseId, assignmentId);
        fetchHighestScore(assignmentId);
    }, [assignmentId, courseId]);

    const mapOptionToLetter = (optionIndex) => {
        const letters = ['a', 'b', 'c', 'd'];
        return letters[optionIndex];
    };

    const handleOptionChange = (index, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[index] = mapOptionToLetter(optionIndex);
        setAnswers(newAnswers);
        console.log('Answers:', answers);
    };

    const handleSubmit = async () => {
        try {
            console.log('Submitting quiz:', answers);
            const response = await axios.post('http://localhost:3000/submission/add-submission',
                {
                    assignmentId,
                    courseId,
                    submission_content: answers
                },
                {
                    headers: {
                        'Auth-Token': `${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            setHighestScore(response.data.data.highest_score);
            fetchAssignmentState(courseId, assignmentId);

            alert('Nộp bài thành công!\n' + 'Điểm của bạn là: ' + response.data.data.submission_detail[response.data.data.submission_detail.length - 1].score);
            console.log('Submission response:', response.data);
        } catch (error) {
            alert(error.response.data.message);
        }

    };

    if (!assignment) {
        return <div>Loading...</div>;
    }

    return (
        <div className='QuizPage'>
            <Navbar />
            <br />
            <div className='flex' id='main-content'>
                <div className='w-1/5' id='assignment-state-container' style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                    <a 
                        className="block max-w-sm p-6 border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" 
                        id='state-background'
                        style={{ backgroundColor: assignmentState === 'Đã hoàn thành' ? 'rgba(0, 128, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)' }}
                    >
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 light:text-black">{assignmentState}</h5>
                        <p className="font-normal text-gray-700 light:text-gray-900">Điểm cao nhất: <span>{highestScore}</span></p>
                    </a>
                </div>
                <div className="w-full justify-center" id='quizs'>
                    <QuizForm
                        assignment={assignment}
                        answers={answers}
                        handleOptionChange={handleOptionChange}
                        handleSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuizAssignment;