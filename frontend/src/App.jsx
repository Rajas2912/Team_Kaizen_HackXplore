import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './common/Navbar.jsx'
import Main from './common/Main.jsx'
import Home from './pagesKM/Home/Home.jsx'
import Login from './pagesPP/login.jsx'
import RegisterForm from './pagesPP/Register.jsx'
import PrivateRoute from './PrivateRoutes.jsx'
import ClassPage from './pagesKM/Pages/ClassPage.jsx'
import ShowViva from './pagesPP/Viva/ShowViva.jsx'

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
          <Route path="/viva-create" element={<ShowViva />} />
          <Route path="/class/:id" element={<ClassPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
