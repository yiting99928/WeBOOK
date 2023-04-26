import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';
import loginImg from './loginImg.png';
import DecoBg from '../../components/DecoBg';
import modal from '../../utils/modal';

function Login() {
  const { user } = useContext(AuthContext);
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
          modal.success('註冊成功');
          navigate('/profile');
        });
        console.log(userCredential);
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            modal.fail('電子信箱已使用');
            break;
          case 'auth/weak-password':
            modal.fail('密碼應至少為6個字符');
            break;
          default:
            modal.fail('註冊失敗，請重試');
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
  function alertTest() {
    prompt(
      '測試用帳號密碼：',
      'yumy19990628@gmail.com yumytest guest@gmail.com aaaaaa'
    );
  }
  return (
    <div>
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
                <span>還不是會員嗎?</span>
                <FlipButton
                  type="button"
                  onClick={handleFlip}
                  value="前往註冊"
                />
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
                <FlipButton
                  type="button"
                  onClick={handleFlip}
                  value="前往登入"
                />
              </FlipContainer>
            </FormContainer>
          </RegisterCard>
        </Cards>
        <LoginImg>
          <img src={loginImg} alt="loginImg" />
        </LoginImg>
      </Container>
    </div>
  );
}
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
`;
const Title = styled.div`
  letter-spacing: 2;
  font-weight: 600;
  font-size: 22px;
  color: #df524d;
  ${'' /* padding-bottom: 12px; */}
`;
const Description = styled.div`
  text-align: center;
  ${'' /* font-size: 14px; */}
`;
const Container = styled.div`
  display: flex;
  margin: 80px auto 140px auto;
  max-width: 1160px;
  justify-content: space-between;
  align-items: center;
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
`;

const FlipButton = styled.input`
  background-color: #fff;
  border: none;
  color: #df524d;
`;
const LoginImg = styled.div`
  max-width: 550px;
`;

export default Login;
