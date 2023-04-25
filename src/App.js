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
import StudyGroups from './pages/StudyGroups/StudyGroups';
import StudyGroup from './pages/StudyGroup/StudyGroup';
import Header from './components/Header/Header';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/studyGroups" element={<StudyGroups />} />
        <Route path="/studyGroup/:id" element={<StudyGroup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/ongoing" element={<Ongoing />} />
        <Route path="/profile/preparing" element={<Preparing />} />
        <Route path="/profile/finished" element={<Finished />} />
        <Route path="/study-group/:id/process" element={<Process />} />
        <Route path="/study-group/:id/live" element={<Live />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
const GlobalStyle = createGlobalStyle`
* {
    box-sizing: border-box;
    ${'' /* border:1px solid black !important */}
}
input{
  border-radius: 4px;
}
.ql-container{
  height:310px;
}
#root{
  display:flex;
  flex-direction:column;
  min-height:100vh;
  font-family:'Poppins', sans-serif;
  position:relative;
}
`;

export default App;
