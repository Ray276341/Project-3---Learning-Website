import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

const TextEditor = ({ assignment, courseId, token }) => {
    const [editorContent, setEditorContent] = useState("");

    const handleSubmit = async () => {
        try {
            // Lưu nội dung dưới dạng HTML
            const file = new Blob([editorContent], { type: "text/html" });
            const formData = new FormData();

            formData.append("assignmentId", assignment._id);
            formData.append("courseId", courseId);
            formData.append("file", new File([file], "submission.html"));

            console.log("Form data:", formData);

            const response = await axios.post("http://localhost:3000/submission/add-submission", formData, {
                headers: {
                    "Auth-Token": token,
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Nộp bài thành công!");
            console.log(response.data);
        } catch (error) {
            console.error("Lỗi khi nộp bài:", error);
            alert("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
        }
    };


    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-md shadow-md min-h-3.5" style={{ border: '1px solid black' }} id="quiz-border">
            <h1 className="text-3xl font-bold mb-6 text-green-400 text-center text-success">
                {assignment.title}
            </h1>
            <h3 className="text-2xl font-bold mb-6 text-center">
                {assignment.description}
            </h3>
            <form id="quizForm" className="space-y-4">
                {assignment.question ?
                    (assignment.questions.map(
                        (question, index) => (
                            <div key={question._id} className="flex flex-col mb-4">
                                <label htmlFor={`q${index}`} className="text-lg text-gray-800 mb-2">
                                    {index + 1}. {question.question_content}
                                </label>
                                {/* <div className="flex flex-col">
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        id={`q${index}o${optionIndex}`}
                                        name={`q${index}`}
                                        value={option}
                                        className="mr-2"
                                        required
                                        onChange={() => handleOptionChange(index, optionIndex)}
                                    />
                                    <label htmlFor={`q${index}o${optionIndex}`} className="text-gray-700">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div> */}
                            </div>
                        )
                    )
                    ) : (
                        <div/>
                    )}
                <hr />
                <h1 className="text-2xl font-bold mb-4">Nộp bài tập</h1>
                <div>
                    <ReactQuill value={editorContent} onChange={setEditorContent} />
                </div>
                <button type="button" onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md mt-8">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default TextEditor;
