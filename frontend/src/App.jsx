import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './common/Navbar.jsx'
import Main from './common/Main.jsx'
import Home from './pagesKM/Home/Home.jsx'
import Login from './pagesPP/login.jsx'
import RegisterForm from './pagesPP/Register.jsx'
import PrivateRoute from './PrivateRoutes.jsx'
import ClassPage from './pagesKM/Pages/ClassPage.jsx'
import LecturePage from './pagesKM/Pages/LecturePage.jsx'
import TakePicture from './pagesPP/Viva/TakePicture.jsx'
import GiveViva from './pagesPP/Viva/GiveViva.jsx'
import StudentReport from './pages_rajas/StudentReport';
import FeedbackPage from './pages_rajas/FeedbackPage.jsx'
import PersonalizedFeedback from './pages_rajas/PersonalizedFeedback.jsx'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<Home />} />
        <Route path="" element={<PrivateRoute />}>
          <Route path="/main" element={<Main />} />
          <Route path="/home" element={<Home />} />
          <Route path="/takepicture/:vivaId" element={<TakePicture/>} />
          <Route path="/give-viva/:vivaId" element={<GiveViva/>} />
          <Route path="/class/:id" element={<ClassPage />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
          <Route path="/report" element={<StudentReport />} />
          <Route path="/feedback" element={<FeedbackPage></FeedbackPage>} />
          <Route path="/personalized" element={<PersonalizedFeedback></PersonalizedFeedback>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
