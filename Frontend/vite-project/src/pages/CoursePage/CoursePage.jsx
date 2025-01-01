import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './CoursePage.css';
import { FaBook, FaVideo, FaQuestionCircle } from 'react-icons/fa';
import axios from 'axios';

const CoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();

    const [lessonDetails, setLessonDetails] = useState({});
    const [courseProgress, setCourseProgress] = useState({});

    useEffect(() => {
        const fetchCourseDetails = async () => {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`http://localhost:3000/course/get-detail/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Auth-Token': `${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                if (response.ok) {
                    setCourse(data.data);
                } else {
                    setError(data.message);
                }
            } catch (error) {
                setError('Failed to fetch course details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    useEffect(() => {
        const fetchLessonDetails = async () => {
            const token = localStorage.getItem('token');
            if (course && course.chapters) {
                for (const chapter of course.chapters) {
                    for (const content of chapter.content) {
                        if (content.content_type === 'lesson') {
                            try {
                                const response = await fetch(`http://localhost:3000/lesson/get-lesson/${courseId}/${content.lesson_id}`, {
                                    method: 'GET',
                                    headers: {
                                        'Auth-Token': `${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                });
                                const lessonData = await response.json();
                                if (response.ok) {
                                    // Store lesson data including the type (video or document)
                                    setLessonDetails(prev => ({
                                        ...prev,
                                        [content.lesson_id]: lessonData.data,
                                    }));
                                }
                            } catch (error) {
                                console.error(`Failed to fetch lesson details for lesson ${content.lesson_id}:`, error);
                            }
                        }
                    }
                }
            }
        };

        fetchLessonDetails();
    }, [course, courseId]);

    useEffect(() => {
        const fetchCourseProgress = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:3000/progress/get-course-progress/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Auth-Token': `${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const progressData = await response.json();

                if (response.ok) {
                    // Create an object with lesson IDs as keys and completed status as values
                    const progressStatus = {};
                    progressData.data.progress.forEach(progress => {
                        progress.lessons_completed.forEach(lessonId => {
                            progressStatus[lessonId] = true; // Mark as completed
                        });
                    });
                    progressData.data.progress.forEach(progress => {
                        progress.assignments_completed.forEach(assignmentId => {
                            progressStatus[assignmentId] = true; // Mark assignment as completed
                        });
                    });
                    setCourseProgress(progressStatus);
                } else {
                    console.error(progressData.message);
                }
            } catch (error) {
                console.error('Error fetching course progress:', error);
            }
        };

        if (courseId) {
            fetchCourseProgress();
        }
    }, [courseId, course]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const lessonIdToScrollTo = queryParams.get('lessonId');

        if (lessonIdToScrollTo) {
            const lessonElement = document.getElementById(lessonIdToScrollTo);
            if (lessonElement) {
                const lessonPosition = lessonElement.getBoundingClientRect().top + window.scrollY - 120;
                window.scrollTo({ top: lessonPosition, behavior: 'smooth' });
            }
        }
    }, [location, course]);

    const calculateCompletionPercentage = () => {
        if (!course || !course.chapters) return 0;

        const totalContent = course.chapters.reduce((total, chapter) => total + chapter.content.length, 0);
        const completedContent = course.chapters.reduce(
            (total, chapter) => total + chapter.content.filter(content => content.completed || courseProgress[content.lesson_id] || courseProgress[content.assignment_id]).length,
            0
        );
        return Math.round((completedContent / totalContent) * 100);
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return <FaVideo className="lesson-icon" />;
            case 'document': return <FaBook className="lesson-icon" />;
            case 'assignment': return <FaQuestionCircle className="lesson-icon" />;
            default: return null;
        }
    };
    
    const renderContent = (content, chapterIndex) => (
        <ul className="lessons-list">
            {content.map((item, index) => {
                const contentData = item.content_type === 'lesson' ? lessonDetails[item.lesson_id] : null;
                const lessonType = contentData ? contentData.type : null;
                const isCompleted = item.completed || 
                            courseProgress[item.lesson_id] || 
                            (item.assignment_id && courseProgress[item.assignment_id._id]);
                const dataState = {
                    chapterIndex,
                    itemIndex: index,
                    detail: null
                };

                let link = ``;
                if (item.content_type === 'lesson') {
                    link = `/lesson/${courseId}/${item.lesson_id}`;
                } else {
                    if (!item.assignment_id) link = '#';
                    else if (item.assignment_id.type.toString() === 'quiz') {
                        link = `/quiz-assignment/${courseId}/${item.assignment_id._id}`;
                    } else {
                        link = `/file-upload-assignment/${courseId}/${item.assignment_id._id}`; // Các thể loại còn lại đều gom vào quiz
                    }
                }

                return (
                    <li
                        key={item._id}
                        id={item._id}
                        className={`lesson-item ${isCompleted ? 'completed' : 'uncompleted'}`}
                    >
                        <Link to={link}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            state={dataState}>

                            {getIconForType(lessonType || item.content_type)} {/* Use the lesson type for icon */}
                            <span>{item.content_type === 'assignment' ? 'Bài tập' : contentData ? contentData.title : `Lesson ${index + 1}`}</span>
                            {isCompleted && <span className="check-circle">&#10003;</span>}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const completionPercentage = calculateCompletionPercentage();

    return (
        <div className='CoursePage'>
            <Navbar />
            <div className="course-content">
                <div className='content-container'>
                    <div className="course-header">
                        <h1>{course.title}</h1>
                        <p className="course-description">{course.description}</p>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        <p>{completionPercentage}% complete</p>
                    </div>
                    {course.chapters.map((chapter, index) => (
                        <div key={index} className="chapter-section">
                            <h2>{chapter.order}. {chapter.chapter_title}</h2>
                            {renderContent(chapter.content, index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursePage;
