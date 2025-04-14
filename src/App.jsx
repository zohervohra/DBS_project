import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import Form from './Components/Form';
import StudentTable from './Components/StudentTable';
import EditStudent from './Components/EditStudent';
import Navbar from './Components/Navbar';
import Analytics from './Components/Analytics';

import './App.css';  // basic event lsitenr
  // basic event lsitenr


function App() {

  return (
    <Router>
      
      <Navbar />
      <div className="h-16 md:h-20"></div> {/* Spacer matching navbar height */}
      
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/form" element={<Form />} />
        
        <Route path="/table" element={<StudentTable/>} />
        <Route path="/editstudent/:id" element={<EditStudent/>} />

        <Route path="/analytics" element={<Analytics />} />
      
        {/* <Route path="/" element={<Login />} /> */}
      </Routes>
    </Router>
    
  );
}

export default App;
