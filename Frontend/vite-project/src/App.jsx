import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import CoursePage from './pages/CoursePage/CoursePage.jsx';
import LessonPage from './pages/LessonPage/LessonPage.jsx';
import ModifyCoursePage from './pages/ModifyCoursePage/ModifyCoursePage.jsx';
import AddAssignmentPage from './pages/AddAssignmentPage/AddAssignmentPage.jsx';
import QuizAssignment from './pages/QuizAsssignmentPage/QuizAssignment.jsx';
import AddCoursePage from './pages/AddCoursePage/AddCoursePage.jsx';
import UpdateCoursePage from './pages/UpdateCoursePage/UpdateCoursePage.jsx';
import ManageCourseStudentPage from './pages/ManageCourseStudentPage/ManageCourseStudentPage.jsx';
import StudentProgressPage from './pages/StudentProgressPage/StudentProgressPage.jsx';
import FileUploadAssignment from './pages/FileUploadAssignment/FileUploadAssignment.jsx';
import CourseManagementPage from './pages/CourseManagementPage/CourseManagementPage.jsx';
import PaymentResult from './pages/PaymentResult/PaymentResult.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/profile" element={<ProfilePage />} /> 
        <Route path="/course/:courseId" element={<CoursePage />} /> 
        <Route path="/lesson/:courseId/:lessonId" element={<LessonPage />} />
        <Route path="/modify-course/:courseId" element={<ModifyCoursePage />} /> 
        <Route path="/add-assignment/:courseId/:chapterId" element={<AddAssignmentPage />} /> 
        <Route path="/add-course" element={<AddCoursePage />} /> 
        <Route path="/update-course/:courseId" element={<UpdateCoursePage />} /> 
        <Route path="/manage-course-student/:courseId" element={<ManageCourseStudentPage />} /> 
        <Route path="/student-progress/:courseId/:userId" element={<StudentProgressPage />} /> 
        <Route path="/quiz-assignment/:courseId/:assignmentId" element={<QuizAssignment />} />
        <Route path="/file-upload-assignment/:courseId/:assignmentId" element={<FileUploadAssignment />} />
        <Route path="/courses-managerment" element={<CourseManagementPage/>}></Route>
        <Route path="/payment-result" element={<PaymentResult />} />
      </Routes>
    </Router>
  );
}

export default App;
