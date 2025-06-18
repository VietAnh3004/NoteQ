import React from 'react'
import SignIn from './pages/SignIn'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';

const App = () => {
  return (
     <Router>
            <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/" element={<Home/>} />
                {/* Add more routes as needed */}
            </Routes>
        </Router>
  )
}

export default App
