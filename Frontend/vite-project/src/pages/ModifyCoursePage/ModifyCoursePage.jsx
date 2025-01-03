import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './ModifyCoursePage.css';
import { FaBook, FaQuestionCircle, FaVideo } from 'react-icons/fa';
import Modal from 'react-modal';
import axios from "axios";

Modal.setAppElement('#root');

const ModifyCoursePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chapterLessons, setChapterLessons] = useState({});
    const [expandedChapters, setExpandedChapters] = useState({});
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
    const [newLessonData, setNewLessonData] = useState({
        title: '',
        description: '',
        type: 'video',
        url: '',
        chapterOrder: null
    });
    const [isAddingChapter, setIsAddingChapter] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [lastAddedChapter, setLastAddedChapter] = useState(null);  // Track the last added chapter
    const [pdfFile, setPdfFile] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteChapterModalOpen, setIsDeleteChapterModalOpen] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:3000/course/get-detail/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Auth-Token': token,
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
                setError('Không thể lấy thông tin khóa học.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if (lastAddedChapter) {
            setExpandedChapters((prev) => ({
                ...prev,
                [lastAddedChapter]: true,
            }));

            const chapterElement = document.getElementById(`chapter-${lastAddedChapter}`);
            if (chapterElement) {
                chapterElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [lastAddedChapter]);

    const toggleChapter = async (chapterId, contentItems) => {
        setExpandedChapters((prev) => ({
            ...prev,
            [chapterId]: !prev[chapterId],
        }));

        if (!chapterLessons[chapterId]) {
            try {
                const token = localStorage.getItem('token');
                const lessons = {};
                for (const content of contentItems) {
                    const response = content.content_type === 'lesson'
                        ? await fetch(`http://localhost:3000/lesson/get-lesson/${courseId}/${content.lesson_id}`, {
                            method: 'GET',
                            headers: {
                                'Auth-Token': token,
                                'Content-Type': 'application/json',
                            },
                        })
                        : { ok: true, json: async () => ({ data: { _id: content.assignment_id, title: 'Bài tập', type: 'assignment' } }) };

                    const data = await response.json();
                    if (response.ok) {
                        lessons[content.content_type === 'lesson' ? data.data._id : content.assignment_id] = data.data;
                    }
                }
                setChapterLessons((prev) => ({ ...prev, [chapterId]: lessons }));
            } catch (error) {
                setError('Không thể tải bài học hoặc bài tập.');
            }
        }
    };


    const openDeleteChapterModal = (chapterId) => {
        setChapterToDelete(chapterId);
        setIsDeleteChapterModalOpen(true);
    };

    const openAddLessonModal = (chapterOrder) => {
        setNewLessonData({ ...newLessonData, chapterOrder });
        setIsAddLessonModalOpen(true);
    };

    const closeAddLessonModal = () => {
        setIsAddLessonModalOpen(false);
        setNewLessonData({
            title: '',
            description: '',
            type: 'video',
            url: '',
            chapterOrder: null
        });
        setError(''); // Reset error message when closing the modal
    };
    const deleteChapter = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/course/delete-chapter/${courseId}/${chapterToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Auth-Token': token,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                // Update the state to remove the chapter from the UI
                setCourse((prev) => ({
                    ...prev,
                    chapters: prev.chapters.filter((chapter) => chapter._id !== chapterToDelete),
                }));
                setIsDeleteChapterModalOpen(false); // Close modal after deletion
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Không thể xóa chương.');
        }
    };

    const addChapter = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/course/add-chapter/${courseId}`, {
                method: 'POST',
                headers: {
                    'Auth-Token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "chapter_title": newChapterTitle }),
            });
            const data = await response.json();
            if (response.ok) {
                setCourse((prev) => ({
                    ...prev,
                    chapters: [
                        ...prev.chapters,
                        {
                            chapter_title: data.data.chapter_title,
                            order: data.data.order,
                            content: []
                        },
                    ],
                }));
                setNewChapterTitle('');
                setIsAddingChapter(false);
                window.location.reload(); // Reload the page after success
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Không thể thêm chương.');
        }
    };

    const handlePdfFileChange = (e) => {
        setPdfFile(e.target.files[0]); // Update state with selected file
    };

    const uploadFileToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'public');
        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dwhavspcm/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.secure_url) {
                return data.secure_url; // Return the file URL from Cloudinary
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            setError('Không thể tải lên tài liệu.');
            throw error;
        }
    };

    const handleDeleteConfirmation = () => {
        deleteCourse();
        setIsDeleteModalOpen(false); // Close the modal after deleting the course
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false); // Close the modal if cancel is clicked
    };

    const deleteCourse = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/course/delete-course/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Auth-Token': token,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/dashboard'); // Redirect to courses list page after successful deletion
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Không thể xóa khóa học.');
        }
    };

    const addLesson = async () => {
        const { title, description, type, chapterOrder, url } = newLessonData;
        const token = localStorage.getItem('token');

        // Create form data to send the request
        const formData = new FormData();
        formData.append('chapter_number', chapterOrder); // Chapter number
        formData.append('lesson[course]', courseId); // Course ID
        formData.append('lesson[title]', title); // Lesson title
        formData.append('lesson[description]', description); // Lesson description
        formData.append('lesson[type]', type); // Lesson type

        // If it's a document lesson, add the file to formData
        if (type === 'document' && pdfFile) {
            formData.append('document', pdfFile); // Attach the selected file
        }
        if (url) {
            formData.append('lesson[url]', url);
        }

        try {
            const response = await axios.post('http://localhost:3000/lesson/add-lesson', formData, {
                headers: {
                    'Auth-Token': token, // Auth token from localStorage
                    'Content-Type': 'multipart/form-data', // Specify multipart
                },
            });

            if (response.status === 201) {
                setError('Thêm bài học thành công!');
                setTimeout(() => {
                    window.location.reload(); // Reload the page after success
                }, 500);
            } else {
                setError(response.data.message || 'Không thể thêm bài học.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Lỗi khi thêm bài học.');
        }
    };


    const getLessonIcon = (type) => {
        if (type === 'video') {
            return <FaVideo className="lesson-icon" />;
        } else if (type === 'assignment') {
            return <FaQuestionCircle className="assignment-icon" />; // Using a question mark for assignment
        }
        return <FaBook className="lesson-icon" />;
    };


    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="CoursePage">
            <Navbar />
            <div className="course-content">
                <div className='content-container'>
                    <div className="course-header">
                        <h1>{course.title}</h1>
                        <p className="course-description">{course.description}</p>
                        <button className="manage-course-student-button" onClick={() => navigate(`/manage-course-student/${courseId}`)}>
                            Quản lý học viên
                        </button>
                        <button className="update-course-button" onClick={() => navigate(`/update-course/${courseId}`)}>
                            Sửa thông tin khóa học
                        </button>
                        <button className="delete-course-button" onClick={() => setIsDeleteModalOpen(true)}>
                            Xóa khóa học
                        </button>
                        {!isAddingChapter ? (
                            <button className="add-chapter-button" onClick={() => setIsAddingChapter(true)}>
                                Thêm chương
                            </button>
                        ) : (
                            <div className="add-chapter-form">
                                <input
                                    type="text"
                                    value={newChapterTitle}
                                    onChange={(e) => setNewChapterTitle(e.target.value)}
                                    placeholder="Nhập tên chương"
                                />
                                <button onClick={addChapter}>Xác nhận</button>
                            </div>
                        )}
                    </div>
                    {course.chapters.map((chapter) => (
                        <div key={chapter.order} className="chapter-section" id={`chapter-${chapter.order}`}>
                            <h2>{chapter.order}. {chapter.chapter_title} ({chapter.content.length} bài học)</h2>
                            <button className="expand-chapter-button" onClick={() => toggleChapter(chapter.order, chapter.content)}>
                                {expandedChapters[chapter.order] ? 'Thu gọn' : 'Mở rộng'}
                            </button>

                            {expandedChapters[chapter.order] && chapterLessons[chapter.order] && (
                                <ul className="lessons-list">
                                    {Object.values(chapterLessons[chapter.order] || {}).map((content) => (
                                        <li key={content._id} className="lesson-item" >
                                            {getLessonIcon(content.type)}
                                            <span>{content.title || 'Untitled'}</span>
                                        </li>
                                    ))}
                                </ul>

                            )}
                            <button className="add-lesson-button" onClick={() => openAddLessonModal(chapter.order)}>
                                Thêm bài học
                            </button>
                            <button className="add-lesson-button" onClick={() => navigate(`/add-assignment/${courseId}/${chapter.order}`)}>
                                Thêm bài tập
                            </button>
                            <button className="delete-chapter-button" onClick={() => openDeleteChapterModal(chapter._id)}>
                                Xóa chương
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {isAddLessonModalOpen && (
                <Modal
                    isOpen={isAddLessonModalOpen}
                    onRequestClose={closeAddLessonModal}
                    contentLabel="Add Lesson"
                    className="lesson-modal"
                    overlayClassName="lesson-modal-overlay"
                >
                    <h2>Thêm Bài Học</h2>
                    <form>
                        <label>
                            Tên bài học:
                            <input
                                type="text"
                                value={newLessonData.title}
                                onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                            />
                        </label>
                        <label>
                            Mô tả:
                            <input
                                type="text"
                                value={newLessonData.description}
                                onChange={(e) => setNewLessonData({ ...newLessonData, description: e.target.value })}
                            />
                        </label>
                        <label>
                            Loại bài học:
                            <select
                                value={newLessonData.type}
                                onChange={(e) => setNewLessonData({ ...newLessonData, type: e.target.value })}
                            >
                                <option value="video">Video</option>
                                <option value="document">Tài liệu</option>
                            </select>
                        </label>
                        {newLessonData.type === 'document' && (
                            <label>
                                Tải lên tài liệu (PDF):
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handlePdfFileChange}
                                />
                            </label>
                        )}
                        <label>
                            URL:
                            <input
                                type="text"
                                value={newLessonData.url}
                                onChange={(e) => setNewLessonData({ ...newLessonData, url: e.target.value })}
                            />
                        </label>
                    </form>
                    {error && <div className="error-message">{error}</div>}
                    <button className="save-button" onClick={addLesson}>Thêm Bài Học</button>
                    <button onClick={closeAddLessonModal}>Hủy</button>
                </Modal>
            )}
            {isDeleteModalOpen && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onRequestClose={handleDeleteCancel}
                    contentLabel="Xóa khóa học"
                    className="delete-modal"
                    overlayClassName="delete-modal-overlay"
                >
                    <h2>Bạn có chắc chắn muốn xóa khóa học này không?</h2>
                    <button className="confirm-button" onClick={handleDeleteConfirmation}>Xác nhận</button>
                    <button className="cancel-button" onClick={handleDeleteCancel}>Hủy</button>
                </Modal>
            )}

            {isDeleteChapterModalOpen && (
                <Modal
                    isOpen={isDeleteChapterModalOpen}
                    onRequestClose={() => setIsDeleteChapterModalOpen(false)}
                    contentLabel="Xóa Chương"
                    className="delete-modal"
                    overlayClassName="delete-modal-overlay"
                >
                    <h2>Bạn có chắc chắn muốn xóa chương này không?</h2>
                    <button className="confirm-button" onClick={deleteChapter}>Xác nhận</button>
                    <button className="cancel-button" onClick={() => setIsDeleteChapterModalOpen(false)}>Hủy</button>
                </Modal>
            )}


            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ModifyCoursePage;

