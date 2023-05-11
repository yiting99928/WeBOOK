import { getAuth, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useContext, useRef, useState } from 'react';
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import { db, storage } from '../../utils/firebase';

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
        setUser(null);
        navigate('/');
      })
      .catch((error) => {
        console.error(error);
      });
  }
  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    const storageRef = ref(
      storage,
      `userImgs/${file.name + file.lastModified}`
    );
    await uploadBytes(storageRef, file);

    const imageURL = await getDownloadURL(storageRef);

    const userDocRef = doc(db, 'users', user.email);
    await updateDoc(userDocRef, { userImg: imageURL });

    setUser((prevUser) => ({
      ...prevUser,
      userImg: imageURL,
    }));
  };
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
              <SideMenuLink>
                <StyledLink to={`/profile`}>我的讀書會</StyledLink>
                <StyledLink to={`/profile/ongoing`}>進行中</StyledLink>
                <StyledLink to={`/profile/preparing`}>準備中</StyledLink>
                <StyledLink to={`/profile/finished`}>已結束</StyledLink>
              </SideMenuLink>
            </SidebarLinks>
            <Logout onClick={logOut}>登出</Logout>
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
const StyledLink = styled(Link)`
  color: black;
  padding: 0px 30px;
  line-height: 2.5;

  &:hover {
    color: #df524d;
  }
`;
const SideMenuLink = styled.div`
  display: flex;
  flex-direction: column;
`;
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
`;

const Content = styled.div`
  transition: all 0.3s ease;
  margin: 0 auto;
  margin-top: 54px;
  margin-bottom: 120px;
  width: 960px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;
const Sidebar = styled.div`
  width: ${({ isOpen }) => (isOpen ? '10%' : '40px')};
  min-width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
  background-color: #eaeaea;
  transition: all 0.3s ease;
  background-color: #fee0d4;
  position: relative;
`;
const SidebarContainer = styled.div`
  position: fixed;
  min-width: ${({ isOpen }) => (isOpen ? '200px' : '40px')};
  width: ${({ isOpen }) => (isOpen ? '10%' : '40px')};
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
  top: 0px;
  left: 0px;
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

const Logout = styled.div`
  margin: 0px 30px;
  line-height: 2;
  margin-top: 10px;
  cursor: pointer;
  border-top: 1px solid gray;
  padding-top: 20px;
  &:hover {
    color: #df524d;
  }
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
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export default SideMenu;
