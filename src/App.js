import { createGlobalStyle } from 'styled-components';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Create from './pages/Create/Create';
import Profile from './pages/Profile/Profile';
import Process from './pages/Process/Process';
import Home from './pages/Home/Home';
import Live from './pages/Live/Live';
import Login from './pages/Login/Login';
import StudyGroups from './pages/StudyGroups/StudyGroups';
import StudyGroup from './pages/StudyGroup/StudyGroup';
import Header from './components/Header/Header';
import Footer from './components/Footer';
import { useContext } from 'react';
import { AuthContext } from './context/authContext';

const UserRouter = () => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  } else {
    return <Outlet />;
  }
};
function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/studyGroups" element={<StudyGroups />} />
        <Route path="/studyGroup/:id" element={<StudyGroup />} />

        <Route element={<UserRouter />}>
          <Route path="/profile/:status?" element={<Profile />} />
          <Route path="/studyGroup/:id/process" element={<Process />} />
          <Route path="/studyGroup/:id/live" element={<Live />} />
          <Route path="/create" element={<Create />} />
        </Route>
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
.swal2-popup{
  width:20em;
  font-family:'Poppins', sans-serif;
}
.swal2-styled.swal2-confirm{
  background-color:#E95F5C;
}
.swal2-title{
  font-size:20px;
  letter-spacing:1.2
}

`;

export default App;
