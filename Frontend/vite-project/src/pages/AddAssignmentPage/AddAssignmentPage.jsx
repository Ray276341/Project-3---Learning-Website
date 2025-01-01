import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MonacoEditor from '@monaco-editor/react'; // Import MonacoEditor
import './AddAssignmentPage.css';
import axios from 'axios';

const AddAssignmentPage = () => {
    const { courseId, chapterId } = useParams();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [assignmentType, setAssignmentType] = useState('quiz'); // Default type
    const [questions, setQuestions] = useState([{ content: '', choices: ['', '', '', ''], correct: 0 }]);

    const mapOptionToLetter = (optionIndex) => {
        const letters = ['a', 'b', 'c', 'd'];
        return letters[optionIndex];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!title || !description || durationHours < 0 || durationMinutes < 0) {
            alert("Please fill in all required fields.");
            return;
        }

        if (durationHours > 4 || durationMinutes >= 60) {
            alert("Invalid duration. Max duration is 4 hours.");
            return;
        }

        const duration = durationHours * 60 * 60 + durationMinutes * 60;

        // Build the assignment data
        const assignment = {
            course: courseId,
            title,
            description,
            type: assignmentType === 'quiz' ? 'quiz' : 'file_upload',
            url: url || null,
            questions: assignmentType === 'quiz' ?
                questions.map(q => ({
                    question_content: q.content,
                    options: q.choices
                })) : null,
            duration: duration,
        };

        const answer = {
            answer_content: assignmentType === 'quiz' ?
                questions.map(q => mapOptionToLetter(q.correct)) : null,
            language: null,
            version: null,
            pre_code: null,
            next_code: null,
            public_testcases: null,
            private_testcases: null,
        };

        console.log(answer);

        const body = {
            chapter_number: chapterId,
            assignment,
            answer
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/assignment/add-assignment', body, {
                headers: {
                    'Auth-Token': token,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                alert("Bài tập đã được thêm thành công!");
                // Redirect or reset form as needed
            } else {
                alert("Có lỗi xảy ra khi thêm bài tập.");
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            alert("Có lỗi xảy ra khi gửi dữ liệu.");
        }
    };

    return (
        <div className="AddAssignmentPage">
            <Navbar />
            <div className="assignment-form-container">
                <h1>Thêm Bài tập</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                        Tiêu đề:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Mô tả:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        URL:
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </label>
                    <label>
                        Thời lượng:
                        <div className="duration-inputs">
                            <select
                                value={durationHours}
                                onChange={(e) => setDurationHours(Number(e.target.value))}
                            >
                                {Array.from({ length: 5 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i} giờ
                                    </option>
                                ))}
                            </select>
                            <select
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i} phút
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>
                    <label>
                        Loại bài tập:
                        <select
                            value={assignmentType}
                            onChange={(e) => setAssignmentType(e.target.value)}
                        >
                            <option value="quiz">Trắc nghiệm</option>
                            <option value="file_upload">Tự luận</option>
                        </select>
                    </label>
                    {assignmentType === 'quiz' && (
                        <div className="questions-container">
                            {questions.map((question, qIndex) => (
                                <div key={qIndex} className="question-item">
                                    <label>
                                        Câu hỏi {qIndex + 1}:
                                        <input
                                            type="text"
                                            value={question.content}
                                            onChange={(e) => {
                                                const updatedQuestions = [...questions];
                                                updatedQuestions[qIndex].content = e.target.value;
                                                setQuestions(updatedQuestions);
                                            }}
                                            required
                                        />
                                    </label>
                                    <div className="choices-container">
                                        {question.choices.map((choice, cIndex) => (
                                            <div key={cIndex} className="choice-item">
                                                <input
                                                    type="text"
                                                    value={choice}
                                                    onChange={(e) => {
                                                        const updatedQuestions = [...questions];
                                                        updatedQuestions[qIndex].choices[cIndex] = e.target.value;
                                                        setQuestions(updatedQuestions);
                                                    }}
                                                    required
                                                />
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={question.correct === cIndex}
                                                    onChange={() => {
                                                        const updatedQuestions = [...questions];
                                                        updatedQuestions[qIndex].correct = cIndex;
                                                        setQuestions(updatedQuestions);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-question-button"
                                        onClick={() => {
                                            const updatedQuestions = questions.filter((_, index) => index !== qIndex);
                                            setQuestions(updatedQuestions);
                                        }}
                                    >
                                        Xóa câu hỏi
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="add-question-button"
                                onClick={() => {
                                    const updatedQuestions = [...questions, { content: '', choices: ['', '', '', ''], correct: 0 }];
                                    setQuestions(updatedQuestions);
                                }}
                            >
                                + Thêm câu hỏi
                            </button>
                        </div>
                    )}
                    <button type="submit" className="submit-button">Thêm Bài Tập</button>
                </form>
            </div>
        </div>
    );
};

export default AddAssignmentPage;
