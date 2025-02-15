import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './common/Navbar.jsx'
import Sidebar from './common/Sidebar.jsx'
import Home from './pagesKM/Home/Home.jsx'
import Login from './pagesPP/login.jsx'
import RegisterForm from './pagesPP/Register.jsx'

function Layout({ children }) {
  const location = useLocation()
  const isAuthPage =
    location.pathname === '/' || location.pathname === '/register'

  return (
    <>
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <Sidebar />}
      {children}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
      </Routes>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
