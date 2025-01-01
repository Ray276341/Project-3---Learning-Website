import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './UpdateCoursePage.css';
import Navbar from '../../components/Navbar/Navbar';
import axios from "axios";

const UpdateCoursePage = () => {
    const [course, setCourse] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const { courseId } = useParams(); // Get courseId from the URL
    const navigate = useNavigate();

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
                    setTitle(data.data.title);
                    setDescription(data.data.description);
                    setPrice(data.data.price);
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

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null); // Reset the selected image
    };

    const handleSubmit = async () => {
        if (!title || !description || price === '') {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        const parsedPrice = parseInt(price, 10);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            alert('Giá phải là một số nguyên dương!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', parsedPrice);
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3000/course/update-course/${courseId}`, formData, {
                headers: {
                    "Auth-Token": token,
                    "Content-Type": "multipart/form-data",
                },
            });

            const data = response.data;
            if (data.success) {
                alert('Chỉnh sửa khóa học thành công!');
                navigate(`/modify-course/${courseId}`);
            } else {
                alert(`Chỉnh sửa khóa học thất bại: ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Đã xảy ra lỗi khi chỉnh sửa khóa học!');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="UpdateCoursePage">
            <Navbar />
            <h1>Chỉnh Sửa Khóa Học</h1>
            <div className="form-container">
                <label>
                    Tiêu đề:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề khóa học"
                    />
                </label>
                <label>
                    Mô tả:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả khóa học"
                    />
                </label>
                <label>
                    Giá (VNĐ):
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Nhập giá khóa học"
                    />
                </label>
                <label className="file-input">
                    Chọn ảnh cho khóa học (không bắt buộc):
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                {selectedImage && (
                    <div className="image-preview">
                        <p>Đã chọn ảnh: {selectedImage.name}</p>
                        <button onClick={handleRemoveImage} className="remove-image-button">
                            X
                        </button>
                    </div>
                )}
                <button onClick={handleSubmit} className="submit-button">
                    Xác nhận chỉnh sửa
                </button>
            </div>
        </div>
    );
};

export default UpdateCoursePage;
