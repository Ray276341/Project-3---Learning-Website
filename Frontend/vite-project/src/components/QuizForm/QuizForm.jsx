import React from 'react';

const QuizForm = ({ assignment, answers, handleOptionChange, handleSubmit }) => {
    const mapOptionToLetter = (optionIndex) => {
        const letters = ['a', 'b', 'c', 'd'];
        return letters[optionIndex];
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-md shadow-md" style={{ border: '1px solid black' }} id="quiz-border">
            <h1 className="text-3xl font-bold mb-6 text-green-400 text-center text-success">
                {assignment.title}
            </h1>
            <h3 className="text-2xl font-bold mb-6 text-center">
                {assignment.description}
            </h3>
            <form id="quizForm" className="space-y-4">
                {assignment.questions.map((question, index) => (
                    <div key={question._id} className="flex flex-col mb-4">
                        <label htmlFor={`q${index}`} className="text-lg text-gray-800 mb-2">
                            {index + 1}. {question.question_content}
                        </label>
                        <div className="flex flex-col">
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
                        </div>
                    </div>
                ))}
                <hr />
                <button type="button" onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md mt-8">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default QuizForm;
