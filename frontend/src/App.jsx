import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './common/Navbar'
import Sidebar from './common/Sidebar'
import Home from './pagesKM/Home/Home'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
