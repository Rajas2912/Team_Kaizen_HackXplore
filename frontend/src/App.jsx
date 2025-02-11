import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './common/Navbar.jsx';
import Sidebar from './common/Sidebar.jsx';
import Home from './pagesKM/Home/Home.jsx';
import Login from './pagesPP/login.jsx';
import RegisterForm from './pagesPP/Register.jsx';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Sidebar />
      <Routes>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<RegisterForm />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
