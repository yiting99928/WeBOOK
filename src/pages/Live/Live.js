import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { useEffect } from 'react';

function Live() {
  const { id } = useParams();
  useEffect(()=>{
    
  },[])
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        <LiveScreen>直播的畫面</LiveScreen>
        <ChatRoom>
          聊天室
          <Message>
            <Guest>
              <span>AAA：</span>嗨嗨
            </Guest>
            <Guest>
              <span>AAA：</span>嗨嗨
            </Guest>
            <Guest>
              <span>AAA：</span>嗨嗨
            </Guest>
            <User>嗨嗨</User>
            <User>嗨嗨</User>
            <User>嗨嗨</User>
            <User>嗨嗨</User>
          </Message>
          <ChatInput>
            <input />
            <input type="button" value="送出" />
          </ChatInput>
        </ChatRoom>
        <Note>小筆記</Note>
      </Content>
    </Container>
  );
}
const Guest = styled.div``;
const User = styled.div`
  align-self: flex-end;
`;
const Message = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 2;
  height: 100%;
  overflow: auto;
`;
const ChatInput = styled.div`
  margin-top: auto;
`;
const LiveScreen = styled.div`
  height: 350px;
  border: 1px solid black;
  width: 70%;
`;

const ChatRoom = styled.div`
  height: 350px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  width: 30%;
`;

const Note = styled.div`
  height: 300px;
  border: 1px solid black;
  width: 100%;
`;
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${(props) => (props.isOpen ? 'calc(100% - 200px)' : '100%')};
`;
export default Live;
