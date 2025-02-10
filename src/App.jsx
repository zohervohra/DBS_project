import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignUp from './Components/SignUp';
import Login from './Components/Login';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
   
        <Route path="/signup" element={<SignUp />} />
        
      
        {/* <Route path="/" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;