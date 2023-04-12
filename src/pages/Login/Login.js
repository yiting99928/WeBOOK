import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

function Login() {
  const [login, setLogin] = useState({
    email: '',
    password: '',
  });
  const [register, setRegister] = useState({
    email: '',
    password: '',
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    // 在此處處理登入邏輯
  };

  //   const handleRegister = (e) => {
  //     e.preventDefault();
  //     console.log(email, password);
  //     createUserWithEmailAndPassword(auth, email, password, name)
  //       .then((userCredential) => {
  //         setDoc(doc(db, 'users', email), {
  //           name: name,
  //           image: '',
  //           account: email,
  //           role: 'teacher',
  //           classes: [],
  //           uid: uid,
  //         }).then(() => {
  //           console.log('註冊成功');
  //           // Redirect to the login page after successful registration
  //           navigate('/login');
  //         });
  //         console.log(userCredential);
  //       })
  //       .catch((error) => {
  //         // const errorCode = error.code;
  //         const errorMessage = error.message;
  //         console.log(errorMessage);
  //       });
  //   };

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
  
    if (type === 'login') {
      setLogin((prev) => ({ ...prev, [name]: value }));
    } else if (type === 'register') {
      setRegister((prev) => ({ ...prev, [name]: value }));
    }
  };

  console.log(login);
    console.log(register);
  return (
    <>
      <div>
        <h1>登入</h1>
        <form onSubmit={handleSubmit}>
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
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="password">密碼：</label>
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
