import { BsGithub, BsLinkedin } from 'react-icons/bs';
import styled from 'styled-components/macro';

export default function Footer() {
  return (
    <Container>
      <div>copyright © 2023 WeBOOK 書適圈</div>
      <ContactIcon>
        <a
          href="https://github.com/yiting99928"
          target="_blank"
          rel="noopener noreferrer">
          <BsGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/yiting-yang999628"
          target="_blank"
          rel="noopener noreferrer">
          <BsLinkedin />
        </a>
      </ContactIcon>
    </Container>
  );
}
const Container = styled.div`
  z-index: 2;
  margin-top: auto;
  position: absolute;
  bottom: 0;
  font-size: 14px;
  color: #fff;
  width: 100%;
  height: 60px;
  background-color: #df524d;
  display: flex;
  padding: 0 70px;
  align-items: center;
`;
const ContactIcon = styled.div`
  display: flex;
  margin-left: auto;
  gap: 30px;
  align-items: center;
  svg {
    transform: scale(1.8);
    color: #fff;
  }
`;
