import styled from 'styled-components/macro';
import React, { useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { getAuth, signOut } from 'firebase/auth';
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
} from 'react-icons/md';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../utils/firebase';

function SideMenu({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef();
  const [isHovering, setIsHovering] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  function logOut() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log(' Sign-out successful');
      })
      .then(() => {
        setUser(null);
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    // 上传文件到 Firebase Storage
    const storageRef = ref(
      storage,
      `userImgs/${file.name + file.lastModified}`
    );
    await uploadBytes(storageRef, file);

    // 获取文件的 URL
    const imageURL = await getDownloadURL(storageRef);

    // 更新 Firebase Firestore 中的 userImg 字段
    const userDocRef = doc(db, 'users', user.email);
    await updateDoc(userDocRef, { userImg: imageURL });

    // 更新本地 user 状态
    setUser((prevUser) => ({
      ...prevUser,
      userImg: imageURL,
    }));
  };
  // console.log(fileInputRef.current);
  return (
    <Container>
      <Sidebar isOpen={isOpen}>
        {isOpen ? (
          <SidebarContainer isOpen={isOpen}>
            <ArrowIcon>
              <MdKeyboardDoubleArrowLeft onClick={toggleSidebar} />
            </ArrowIcon>
            <SidebarLinks>
              <User>
                <UserImgContainer
                  previewurl={user.userImg}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    name="image"
                    onChange={handleImageChange}
                    hidden
                    ref={fileInputRef}
                  />
                  {isHovering && (
                    <UploadText onClick={() => fileInputRef.current.click()}>
                      上傳圖片
                    </UploadText>
                  )}
                </UserImgContainer>

                <UserName>Hi! {user.name}</UserName>
              </User>
              <br />
              <br />
              <Link to={`/profile`}>所有讀書會</Link>
              <Link to={`/profile/ongoing`}>進行中</Link>
              <Link to={`/profile/preparing`}>準備中</Link>
              <Link to={`/profile/finished`}>已結束</Link>
              <br />
              <Logout onClick={logOut}>登出</Logout>
            </SidebarLinks>
          </SidebarContainer>
        ) : (
          <SidebarContainer>
            <ArrowIcon>
              <MdKeyboardDoubleArrowRight onClick={toggleSidebar} />
            </ArrowIcon>
          </SidebarContainer>
        )}
      </Sidebar>
      <Content isOpen={true}>{children}</Content>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  transition: all 0.3s ease;
  margin: 0 auto;
  margin-top: 54px;
  margin-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 960px;
`;
const Sidebar = styled.div`
  width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
  background-color: #eaeaea;
  transition: all 0.3s ease;
  background-color: #fee0d4;
  position: relative;
`;
const SidebarContainer = styled.div`
  position: fixed;
  width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
`;
const User = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;
const UserName = styled.div`
  font-weight: 600;
`;
const UserImgContainer = styled.div`
  position: relative;
  height: 100px;
  width: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background-size: cover;
  background-image: ${({ previewurl }) => `url(${previewurl})`};
`;
const UploadText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 14px;

  ${UserImgContainer}:hover & {
    opacity: 1;
  }
`;

const UserImg = styled.img`
  height: 100px;
  width: 100px;
  border-radius: 50%;
  object-fit: cover;
`;
const Logout = styled.div`
  padding-top: 20px;
  border-top: 1px solid #5b5b5b;
  cursor: pointer;
`;
const ArrowIcon = styled.div`
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  svg {
    transform: scale(1.3);
  }
`;
const SidebarLinks = styled.div`
  padding-top: 70px;
  padding-right: 30px;
  padding-left: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export default SideMenu;
