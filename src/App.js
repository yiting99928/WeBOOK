import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateStudyGroup from './pages/CreateStudyGroup/CreateStudyGroup'
import Home from './pages/Home/Home'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/create" element={<CreateStudyGroup />}/>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
