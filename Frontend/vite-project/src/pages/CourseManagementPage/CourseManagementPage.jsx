import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import axios from 'axios';

const courseData = [
    {
        "_id": "671bb65ea42ed62c0ae36734",
        "title": "Xây dựng Website với ReactJS",
        "description": "Khóa học ReactJS từ cơ bản tới nâng cao, kết quả của khóa học này là bạn có thể làm hầu hết các dự án thường gặp với ReactJS. Cuối khóa học này bạn sẽ sở hữu một dự án giống Tiktok.com, bạn có thể tự tin đi xin việc khi nắm chắc các kiến thức được chia sẻ trong khóa học này.",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "__v": 121,
        "category": [],
        "create_at": "2024-11-01T08:57:45.179Z",
        "update_at": "2024-11-01T08:57:45.179Z",
        "image": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/course-image/671bb65ea42ed62c0ae36734-1731675572996.png"
    },
    {
        "_id": "671bc883a42ed62c0ae36736",
        "title": "Khoá học free mẫu 1",
        "description": "Đây là khoá học free mẫu 1.",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "__v": 10,
        "category": [],
        "create_at": "2024-11-03T15:35:20.313Z",
        "update_at": "2024-11-03T15:35:20.313Z"
    },
    {
        "_id": "671bc902a42ed62c0ae36737",
        "title": "Khoá học free mẫu 2",
        "description": "Đây là khoá học free mẫu 2.",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "__v": 8,
        "category": [],
        "create_at": "2024-11-15T12:27:48.402Z",
        "update_at": "2024-11-15T12:27:48.403Z"
    },
    {
        "category": [],
        "_id": "671bc926a42ed62c0ae36738",
        "title": "Khoá học free mẫu 3",
        "description": "Đây là khoá học free mẫu 3.",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "create_at": "2024-11-28T01:49:07.057Z",
        "update_at": "2024-11-28T01:49:07.057Z"
    },
    {
        "category": [],
        "_id": "671bc944a42ed62c0ae36739",
        "title": "Khoá học có phí mẫu 1",
        "description": "Đây là khoá học có phí mẫu 1.",
        "price": 200000,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "create_at": "2024-11-28T01:49:07.057Z",
        "update_at": "2024-11-28T01:49:07.057Z"
    },
    {
        "_id": "6745fa2579b9bfeecf746310",
        "title": "khóa học test",
        "description": "mô tả test",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "category": [],
        "create_at": "2024-11-26T16:41:09.391Z",
        "update_at": "2024-11-26T16:41:09.391Z",
        "__v": 0
    },
    {
        "_id": "6745fb9179b9bfeecf74631b",
        "title": "Khóa học test",
        "description": "Test thêm khóa học",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "category": [],
        "create_at": "2024-11-26T16:47:13.057Z",
        "update_at": "2024-11-26T16:47:13.057Z",
        "__v": 0
    },
    {
        "_id": "6745fbeb79b9bfeecf74631d",
        "title": "Khóa học test",
        "description": "thêm thử khóa học",
        "price": 0,
        "instructor": {
            "_id": "671bb5f61d927de561daadbb",
            "fullname": "Người hướng dẫn mẫu 1",
            "avatar": "https://learningwebsite-1.s3.ap-southeast-1.amazonaws.com/user-avatar/671bb5f61d927de561daadbb-1731666781119.jpg"
        },
        "category": [],
        "create_at": "2024-11-26T16:48:43.887Z",
        "update_at": "2024-11-26T16:48:43.888Z",
        "__v": 0
    }
];


const CourseManagementPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/sign-in');
        } else {
            axios
                .get('http://localhost:3000/user/user-info', {
                    headers: {
                        'Auth-Token': token,
                    },
                })
                .then((response) => {
                    if (response.data && response.data.user) {
                        setUser(response.data.user);
                        if (response.data.user.role !== 'instructor') {
                            alert('You are not an instructor');
                            navigate('/dashboard');
                        }
                    } else {
                        console.error('Invalid response structure:', response.data);
                        navigate('/sign-in');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user info:', error);
                    navigate('/sign-in');
                });
        }
    }, [navigate]);


    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    const [myCourses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [coursesPerPage] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleCourseClick = (course) => {
        navigate(`/modify-course/${course._id}`);    
    };
    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const response = await fetch(`http://localhost:3000/course/find-by-instructor/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Auth-Token': token,
                    },
                    body: JSON.stringify({
                        pageSize: coursesPerPage,
                        pageNumber: currentPage,
                    }),
                });

                const data = await response.json();
                console.log(data);
                if (data.success) {
                    setCourses(data.data);
                    setTotalPages(data.totalPages);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchMyCourses();
    }, [currentPage]);

    const handleSearch = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/course/search-courses?keyword=${encodeURIComponent(searchKeyword)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();
            if (data.success) {
                setCourses(data.data);
                setTotalPages(1);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error searching courses:', error);
        }
    };

    const formatPrice = (price) => {
        return (!price) ? 'Miễn phí' : price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return (
        <div className='InstructorsManagement'>
            <Navbar />
            <div>
                <div className="search-section mx-auto">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-button">Tìm</button>
                </div>
                <div className="courses-container mx-auto">
                    <h1 className='text-lg'>Các khóa học do bạn quản lý: </h1>
                    <div className="courses-section">
                        {myCourses.length > 0 ? (
                            <div className="courses-grid">
                                {myCourses.map((course) => (
                                    <div key={course._id} className="course-item" onClick={() => handleCourseClick(course)}>
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="course-image"
                                        />
                                        <h3 className="course-title">{course.title}</h3>
                                        <p className="price">{formatPrice(course.price)}</p>
                                        <div className="instructor">
                                            <img
                                                src={course.instructor.avatar}
                                                alt="Instructor Avatar"
                                                className="instructor-avatar"
                                            />
                                            <span className="instructor-name">{course.instructor.fullname}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Không có khóa học nào.</p>
                        )}
                    </div>
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                disabled={currentPage === i + 1}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        className="add-course-button" 
                        onClick={() => navigate('/add-course')}>
                        Thêm khóa học
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default CourseManagementPage;
