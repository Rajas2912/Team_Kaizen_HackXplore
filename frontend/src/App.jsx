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
<<<<<<< HEAD
import StudentReport from './pages_rajas/StudentReport';

=======
import GivePicture from './pagesPP/Quiz/GivePicture.jsx'
import GiveQuiz from './pagesPP/Quiz/GiveQuiz.jsx'
>>>>>>> 3274795329aa85f310ad295f6e74cf5c11f67650
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
          <Route path="/givepicture/:quizId" element={<GivePicture/>} />
          <Route path="/give-quiz/:quizId" element={<GiveQuiz/>} />
          <Route path="/give-viva/:vivaId" element={<GiveViva/>} />
          <Route path="/class/:id" element={<ClassPage />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
          <Route path="/report" element={<StudentReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
