import { useContext } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Footer from './components/Footer';
import Header from './components/Header';
import { AuthContext } from './context/authContext';
import Create from './pages/Create';
import Home from './pages/Home';
import Live from './pages/Live';
import Login from './pages/Login';
import Process from './pages/Process';
import Profile from './pages/Profile';
import StudyGroup from './pages/StudyGroup';
import StudyGroups from './pages/StudyGroups';

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
        <Route path="/study-groups" element={<StudyGroups />} />
        <Route path="/study-group/:id" element={<StudyGroup />} />

        <Route element={<UserRouter />}>
          <Route path="/profile/:status?" element={<Profile />} />
          <Route path="/study-group/:id/process" element={<Process />} />
          <Route path="/study-group/:id/live" element={<Live />} />
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
    border:1px solid black !important
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
