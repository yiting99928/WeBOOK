import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';

function Login() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log('user', user);
  const [login, setLogin] = useState({
    email: '',
    password: '',
  });
  const [register, setRegister] = useState({
    name: '',
    email: '',
    password: '',
  });
  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        login.email,
        login.password,
        login.name
      );
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // alert('登入成功');
        navigate('/profile');
      }
    } catch (error) {
      console.log(error.message);
      alert('錯誤的帳號或密碼');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(
      auth,
      register.email,
      register.password,
      register.name
    )
      .then((userCredential) => {
        setDoc(doc(db, 'users', register.email), {
          name: register.name,
          password: register.password,
          email: register.email,
        }).then(() => {
          console.log('註冊成功');
          navigate('/profile');
        });
        console.log(userCredential);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;

    if (type === 'login') {
      setLogin((prev) => ({ ...prev, [name]: value }));
    } else if (type === 'register') {
      setRegister((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <div>
        <p>yumy19990628@gmail.com</p>
        <p>yumytest</p>
        <p>guest@gmail.com</p>
        <p>aaaaaa</p>
        <h1>登入</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">電子郵件：</label>
            <input
              type="email"
              name="email"
              value={login.email}
              onChange={(e) => handleInputChange(e, 'login')}
              required
            />
          </div>
          <div>
            <label htmlFor="password">密碼：</label>
            <input
              type="password"
              name="password"
              value={login.password}
              onChange={(e) => handleInputChange(e, 'login')}
              required
            />
          </div>
          <button type="submit">登入</button>
        </form>
      </div>
      <div>
        <h1>註冊</h1>
        <form onSubmit={handleRegister}>
          <div>
            <label htmlFor="email">姓名：</label>
            <input
              type="text"
              name="name"
              value={register.name}
              onChange={(e) => handleInputChange(e, 'register')}
              required
            />
          </div>
          <div>
            <label htmlFor="email">電子郵件：</label>
            <input
              type="email"
              name="email"
              value={register.email}
              onChange={(e) => handleInputChange(e, 'register')}
              required
            />
          </div>
          <div>
            <label htmlFor="password">密碼：麻煩給我六個字</label>
            <input
              type="password"
              name="password"
              value={register.password}
              onChange={(e) => handleInputChange(e, 'register')}
              required
            />
          </div>
          <button type="submit">註冊</button>
        </form>
      </div>
    </>
  );
}

export default Login;
