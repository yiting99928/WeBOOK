import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${(props) => (props.isOpen ? 'calc(100% - 200px)' : '100%')};
`;

function Finished() {
  return (
    <Container>
      <SideMenu />
      <Content>
        <p>結束</p>
      </Content>
    </Container>
  );
}
export default Finished;
