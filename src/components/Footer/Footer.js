import styled from 'styled-components/macro';
import linkedin from './linkedin.png';
import github from './github.png';

export default function Footer() {
  return (
    <Container>
      <div>copyright © 2023 WeBOOK 書適圈</div>
      <ContactIcon>
        <ContactImg contact={linkedin}></ContactImg>
        <ContactImg contact={github}></ContactImg>
      </ContactIcon>
    </Container>
  );
}
const Container = styled.div`
  z-index: 2;
  ${'' /* margin-top: auto; */}
  position:absolute;
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
  gap: 10px;
`;
const ContactImg = styled.div`
  height: 35px;
  width: 35px;
  background-image: url(${(props) => props.contact});
  background-size: cover;
`;
