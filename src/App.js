import React, { useContext } from 'react';
import { createGlobalStyle } from 'styled-components';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Create from './pages/Create/Create';
import Profile from './pages/Profile/Profile';
import Process from './pages/Process/Process';
import Home from './pages/Home/Home';
import Ongoing from './pages/Profile/Ongoing';
import Finished from './pages/Profile/Finished';
import Preparing from './pages/Profile/Preparing';
import Live from './pages/Live/Live';
import Login from './pages/Login/Login';
function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/ongoing" element={<Ongoing />} />
        <Route path="/profile/preparing" element={<Preparing />} />
        <Route path="/profile/finished" element={<Finished />} />
        <Route path="/study-group/:id/process" element={<Process />} />
        <Route path="/study-group/:id/live" element={<Live />} />
      </Routes>
    </BrowserRouter>
  );
}
const GlobalStyle = createGlobalStyle`
* {
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
    ${'' /* border:1px solid black !important */}
}
.ql-container{
  height:400px
}
`;

export default App;
