import styled from 'styled-components/macro';
import SideMenu from '../SideMenu';

function ProfileStudyGroup({
  children,
}) {
  return (
    <Container>
      <SideMenu isOpen={true} />
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
  width: 800px;
`;

export default ProfileStudyGroup;
