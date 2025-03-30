
import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Main from './common/Main.jsx'
import Home from './pagesKM/Home/Home.jsx'
import Login from './pagesPP/login.jsx'
import RegisterForm from './pagesPP/Register.jsx'
import PrivateRoute from './PrivateRoutes.jsx'
import ClassPage from './pagesKM/Pages/ClassPage.jsx'
import LecturePage from './pagesKM/Pages/LecturePage.jsx'
import TakePicture from './pagesPP/Viva/TakePicture.jsx'
import GiveViva from './pagesPP/Viva/GiveViva.jsx'

import GivePicture from './pagesPP/Quiz/GivePicture.jsx'
import GiveQuiz from './pagesPP/Quiz/GiveQuiz.jsx'
import temp from './Component/Temp.jsx';
// import StudentReport from './pages_rajas/StudentReport'
import FeedbackPage from './pages_rajas/FeedbackPage.jsx'
import PersonalizedFeedback from './pages_rajas/PersonalizedFeedback.jsx'
import Mindmap from './pages_rajas/Mindmap.jsx'
import Studentreport2 from './pages_rajas/Studentreport2.jsx'
import HomePage from './pagesPP/VideoCall/VideoMetting.jsx'
import VideoMeeting from './pagesPP/VideoCall/VideoMetting.jsx'
import RoomMeet from './pagesPP/VideoCall/RoomMeet.jsx'
import Studentreport3 from './pages_rajas/Student_report3.jsx'
import FeedbackPro from './pages_rajas/FeedbackPro.jsx'
import Main_Banner from './New_pages/Main_Banner.jsx'
import AudioConferenceTest from './Conference/AudioConferenceTest.jsx'
import FaceCapture from './pagesKM/Pages/RegisterFace.jsx'
import GitHubViewer from './New_pages/GithubRepo.jsx'
import CollaborativeProjectReport from './pagesKM/Pages/CollaborativeProjectReport.jsx'
import TeacherProjectPage from './pagesKM/Pages/TeacherProjectPage.jsx'
import StudentProjectPage from './pagesKM/Pages/StudentProjectPage.jsx'
import ProjectDocViewer from './pagesKM/Pages/ProjectDocViewer.jsx'
import Research from './Research Papers/Research.jsx';
import LandingPage from './New_pages/Landing.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/audio" element={<AudioConferenceTest></AudioConferenceTest>} />
        <Route path="/" element={<Home />} />
        {/* <Route path="/3d" element={<Main_Banner></Main_Banner>} /> */}
        <Route path="/landing" element={<LandingPage></LandingPage>} />
        <Route path="/paper" element={<Research></Research>} />
        <Route path="/git" element={<GitHubViewer></GitHubViewer>} />
        <Route path="/docteacher" element={<TeacherProjectPage></TeacherProjectPage>} />
        <Route path="/docstudent" element={<StudentProjectPage></StudentProjectPage>} />
        <Route path="" element={<PrivateRoute />}>
          <Route path="/main" element={<Main />} />
          <Route path="/home" element={<Home />} />
          <Route path="/takepicture/:vivaId" element={<TakePicture />} />
          <Route path="/givepicture/:quizId" element={<GivePicture />} />
          <Route path="/give-quiz/:quizId" element={<GiveQuiz />} />
          <Route path="/give-viva/:vivaId" element={<GiveViva />} />
          <Route path="/takepicture/:vivaId" element={<TakePicture />} />
          <Route path="/give-viva/:vivaId" element={<GiveViva />} />
          <Route path="/project-doc/:docId" element={<ProjectDocViewer></ProjectDocViewer>} />
          {/* <Route path="/room" element={<VideoMeeting />} />{} */}
          <Route path="/room/:classId/:roomId" element={<RoomMeet />} />
          <Route path="/class/:id" element={<ClassPage />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
          <Route path="/temp" element={<temp/>}/>
          <Route path="/studentreport/:assignmentId" element={<Studentreport2/>}/>
          <Route path="/facecapture" element={<FaceCapture></FaceCapture>}/>
          <Route path="/mindmap" element={<Mindmap></Mindmap>} />
          <Route path="/report" element={<Studentreport3></Studentreport3>} />
          <Route path="/feedback" element={<FeedbackPro></FeedbackPro>} />
          <Route
            path="/personalized"
            element={<PersonalizedFeedback></PersonalizedFeedback>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
