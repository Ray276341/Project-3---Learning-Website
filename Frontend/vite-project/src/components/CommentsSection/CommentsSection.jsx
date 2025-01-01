import React, { useEffect, useState } from 'react';
import './CommentsSection.css';

const CommentsSection = ({ lessonId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [replyContent, setReplyContent] = useState({}); // To hold reply inputs for each comment

    const fetchComments = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/lesson/get-comments-of-lesson/${lessonId}`, {
                method: 'GET',
                headers: {
                    'Auth-Token': `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.ok) {
                const sortedComments = data.data.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
                setComments(sortedComments);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Không thể lấy bình luận.');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [lessonId]);

    const handleAddComment = async () => {
        const token = localStorage.getItem('token');

        if (!newComment.trim()) {
            setError("Bình luận không được để trống.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/lesson/new-comment`, {
                method: 'POST',
                headers: {
                    'Auth-Token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lessonId: lessonId,
                    content: newComment,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setNewComment('');
                setError('');
                fetchComments();  // Refresh comments after adding new comment
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Không thể thêm bình luận.');
        }
    };

    const handleAddReply = async (commentId) => {
        const token = localStorage.getItem('token');

        if (!replyContent[commentId]?.trim()) {
            setError("Phản hồi không được để trống.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/lesson/reply-comment`, {
                method: 'POST',
                headers: {
                    'Auth-Token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lessonId: lessonId,
                    commentId: commentId,
                    content: replyContent[commentId],
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
                fetchComments();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Không thể thêm phản hồi.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        return date.toLocaleString('vi-VN', options).replace(',', '');
    };

    return (
        <div className="comments-section">
            <h3>Bình luận</h3>

            <div className="add-comment">
                <textarea
                    placeholder="Viết bình luận mới..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-textarea"
                    rows="3"
                />
                <button onClick={handleAddComment} className="add-comment-button">Thêm bình luận mới</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment._id} className="comment">
                        <div className="comment-header">
                            <img src={comment.userId.avatar} alt="Hình đại diện người dùng" className="avatar" />
                            <div className="comment-body">
                                <p><strong>{comment.userId.fullname}</strong></p>
                                <p className="comment-content">{comment.content}</p>
                                <p className="comment-date">Đăng vào: {formatDate(comment.create_at)}</p>
                            </div>
                        </div>

                        <div className="add-reply">
                            <textarea
                                placeholder="Viết phản hồi..."
                                value={replyContent[comment._id] || ''}
                                onChange={(e) => setReplyContent((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                                className="reply-textarea"
                                rows="2"
                            />
                            <button onClick={() => handleAddReply(comment._id)} className="add-reply-button">Phản hồi</button>
                        </div>

                        {comment.reply.length > 0 && (
                            <div className="replies">
                                {comment.reply.map((reply) => (
                                    <div key={reply._id} className="reply">
                                        <div className="reply-header">
                                            <img src={reply.userId.avatar} alt="Hình đại diện người dùng" className="avatar" />
                                            <div className="reply-body"> 
                                                <p><strong>{reply.userId.fullname}</strong></p>
                                                <p className="reply-content">{reply.content}</p>
                                                <p className="reply-date">Phản hồi vào: {formatDate(reply.create_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>Chưa có bình luận nào.</p>
            )}
        </div>
    );
};

export default CommentsSection;
