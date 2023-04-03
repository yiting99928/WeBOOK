import React from 'react';
import { Reset } from 'styled-reset';
import { createGlobalStyle } from 'styled-components';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateStudyGroup from './pages/CreateStudyGroup/CreateStudyGroup';
import MemberStudyGroup from './pages/Member/MemberStudyGroup';
import Process from './pages/Member/Process';
import Home from './pages/Home/Home';

const GlobalStyle = createGlobalStyle`
  *{
    box-sizing: border-box;
  }
  *,
  *::after,
  *::before {
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      -webkit-transition: all 0.2s;
      transition: all 0.2s;
  }

  img {
      display: block;
  }

  a:link {
      text-decoration: none;
      color: black;
  }

  a:visited {
      text-decoration: none;
      color: black;
  }

  input[type=text]:focus {
      outline: none;
  }
`;

function App() {
  return (
    <BrowserRouter>
      <Reset />
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateStudyGroup />} />
        <Route path="/member" element={<MemberStudyGroup />} />
        <Route path="/study-group/:id/process" element={<Process />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
