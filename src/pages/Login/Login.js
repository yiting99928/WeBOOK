import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';

import DecoBg from '../../components/DecoBg';
import { auth, db } from '../../utils/firebase';
import modal from '../../utils/modal';
import LoginImg from './LoginImg';

function Login() {
  const navigate = useNavigate();
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
      await signInWithEmailAndPassword(auth, login.email, login.password);
      modal.success('登入成功');
      navigate('/study-groups');
    } catch (error) {
      modal.quit('錯誤的帳號或密碼');
    }
  };
  const ImgUrl = [
    'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg1.jpg?alt=media&token=869610eb-fe80-46ff-af95-80466259352a',
    'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg3.jpg?alt=media&token=3a0d39d1-b449-43b6-9426-06c193a18082',
    'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg2.jpg?alt=media&token=e90f2681-4fa8-479f-9e2c-dab3a787a192',
    'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg4.jpg?alt=media&token=37d32861-c9d0-4046-a2ba-daa9d06acc9f',
    'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg5.jpg?alt=media&token=430ce74b-8e60-462e-ad8b-c7d2b01fa471',
  ];
  const handleRegister = async (e) => {
    e.preventDefault();
    const randomUserImgURL = ImgUrl[Math.floor(Math.random() * ImgUrl.length)];
    createUserWithEmailAndPassword(auth, register.email, register.password)
      .then((userCredential) => {
        setDoc(doc(db, 'users', register.email), {
          name: register.name,
          password: register.password,
          email: register.email,
          userImg: randomUserImgURL,
        }).then(() => {
          modal.success('註冊成功');
        });
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            modal.quit('電子信箱已使用');
            break;
          case 'auth/weak-password':
            modal.quit('密碼應至少為6個字符');
            break;
          case 'auth/invalid-email':
            modal.quit('無效的電子郵件');
            break;
          default:
            modal.quit('註冊失敗，請重試');
        }
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

  const [isFlipped, setIsFlipped] = useState(false);

  function handleFlip() {
    setIsFlipped(!isFlipped);
  }

  const handleResetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, login.email)
      .then(() => {
        modal.success('重置密碼郵件已發送，請查收並按照提示操作');
      })
      .catch((error) => {
        modal.quit('發送重置密碼郵件失敗，請確保電子郵件正確無誤');
      });
  };

  function alertTest() {
    prompt(
      '測試用帳號密碼：',
      'yumy19990628@gmail.com yumytest guest@gmail.com aaaaaa'
    );
  }
  return (
    <CenterContainer>
      <DecoBg height={550} />
      <Container>
        <Cards isFlipped={isFlipped}>
          <LoginCard>
            <FormTitle>
              <Title>登入</Title>
            </FormTitle>
            <FormContainer onSubmit={handleLogin}>
              <Description onClick={alertTest}>
                加入WeBOOK展開全新的讀書會體驗
              </Description>
              <div>
                <div>電子郵件</div>
                <FormInput
                  type="email"
                  name="email"
                  value={login.email}
                  onChange={(e) => handleInputChange(e, 'login')}
                  required
                />
              </div>
              <div>
                <div>密碼</div>
                <FormInput
                  type="password"
                  name="password"
                  value={login.password}
                  onChange={(e) => handleInputChange(e, 'login')}
                  required
                />
              </div>
              <SubmitInput type="submit">送出</SubmitInput>
              <FlipContainer>
                <ResetPassword onClick={handleResetPassword}>
                  忘記密碼
                </ResetPassword>
                <p>還不是會員嗎?</p>
                <FlipButton onClick={handleFlip}>前往註冊</FlipButton>
              </FlipContainer>
            </FormContainer>
          </LoginCard>
          <RegisterCard>
            <FormTitle>
              <Title>註冊</Title>
            </FormTitle>
            <FormContainer onSubmit={handleRegister}>
              <div>
                <div>姓名</div>
                <FormInput
                  type="text"
                  name="name"
                  value={register.name}
                  onChange={(e) => handleInputChange(e, 'register')}
                  required
                />
              </div>
              <div>
                <div>電子郵件</div>
                <FormInput
                  type="email"
                  name="email"
                  value={register.email}
                  onChange={(e) => handleInputChange(e, 'register')}
                  required
                />
              </div>
              <div>
                <div>密碼</div>
                <FormInput
                  type="password"
                  name="password"
                  value={register.password}
                  onChange={(e) => handleInputChange(e, 'register')}
                  required
                />
              </div>
              <SubmitInput type="submit">送出</SubmitInput>
              <FlipContainer>
                <span>已經是會員</span>
                <FlipButton onClick={handleFlip}>前往登入</FlipButton>
              </FlipContainer>
            </FormContainer>
          </RegisterCard>
        </Cards>
        <LoginImg />
      </Container>
    </CenterContainer>
  );
}
const CenterContainer = styled.div`
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const FormTitle = styled.div`
  padding-bottom: 24px;
  border-bottom: 1px solid #a9a9a9;
  text-align: center;
`;
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
  height: 100%;
`;
const FormInput = styled.input`
  border: 1px solid;
  width: 100%;
  height: 32px;
  border: 1px solid #909090;
  padding: 8px 12px;
  margin-top: 8px;
`;
const SubmitInput = styled.button`
  width: 100%;
  background: #ffac4c;
  border-radius: 4px;
  padding: 6px 12px;
  color: #fff;
  letter-spacing: 1;
  border: 0;
  height: 44px;
  font-size: 18px;
  font-weight: 600;
  margin-top: auto;
  cursor: pointer;
`;
const Title = styled.div`
  letter-spacing: 2;
  font-weight: 600;
  font-size: 22px;
  color: #df524d;
`;
const Description = styled.div`
  text-align: center;
`;
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
  padding: 0 30px;
`;

const Cards = styled.div`
  background-color: #fff;
  position: relative;
  transition: transform 0.5s;
  transform-style: preserve-3d;
  transform: ${({ isFlipped }) => (isFlipped ? 'rotateY(180deg)' : 'none')};
  min-width: 400px;
  height: 450px;
  box-shadow: 0px 0px 17px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;

const LoginCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 100%;
  padding: 24px;
  position: absolute;
  backface-visibility: hidden;
`;

const RegisterCard = styled(LoginCard)`
  transform: rotateY(180deg);
`;

const FlipContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;
const ResetPassword = styled.a`
  margin-right: auto;
  cursor: pointer;
`;
const FlipButton = styled.div`
  background-color: #fff;
  border: none;
  color: #df524d;
  cursor: pointer;
`;

export default Login;
