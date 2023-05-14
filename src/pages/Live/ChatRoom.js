import React from 'react';
import styled from 'styled-components';
import {IoIosArrowForward} from 'react-icons/io'

export function ChatRoom({
  showChatRoom,
  sendMessage,
  MessageInput,
  setMessageInput,
  messagesEndRef,
  messages,
  user
}) {
  return (
    <ChatRoomContainer showChatRoom={showChatRoom}>
      <ChatTitle>聊天室</ChatTitle>
      <Message>
        {messages.map((message, index) => {
          if (message.sender === null) {
            return <SystemMessage key={index}>{message.message}</SystemMessage>;
          } else if (user.email === message.sender) {
            return <UserMessage key={index}>{message.message}</UserMessage>;
          } else {
            return (
              <GuestMessage key={index}>
                <UserImg src={message.sanderImg} alt="userImg" />
                <SenderMessage>
                  <SenderName>{message.senderName}</SenderName>
                  <p>{message.message}</p>
                </SenderMessage>
              </GuestMessage>
            );
          }
        })}
        <div
          ref={(el) => {
            messagesEndRef.current = el;
          }}
        />
      </Message>
      <ChatInput>
        <form onSubmit={sendMessage}>
          <input
            value={MessageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button type="submit">
            <IoIosArrowForward />
          </button>
        </form>
      </ChatInput>
    </ChatRoomContainer>
  );
}
const SenderMessage = styled.div`
  background-color: #f1f1f1;
  padding: 5px 10px;
  border-radius: 6px;
`;
const ChatRoomContainer = styled.div`
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  display: ${({ showChatRoom }) => (showChatRoom ? 'flex' : 'none')};
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  width: 230px;
`;
const SenderName = styled.div`
  color: #5b5b5b;
  font-size: 12px;
`;
const GuestMessage = styled.div`
  border-radius: 6px;
  align-items: center;
  align-self: flex-start;
  display: inline-flex;
`;
const UserImg = styled.img`
  width: 35px;
  height: 35px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 50%;
  align-self: flex-start;
  object-fit: cover;
`;
const UserMessage = styled(GuestMessage)`
  padding: 5px 10px;
  background-color: #f1f1f1;
  align-self: flex-end;
`;
const SystemMessage = styled.div`
  text-align: center;
  color: #df524d;
`;
const Message = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 2;
  height: 500px;
  overflow: auto;
  padding: 10px;
  gap: 10px;
  font-size: 14px;
`;
const ChatInput = styled.div`
  margin-top: auto;
  background-color: #f1f1f1;
  margin: 10px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  form {
    display: flex;
    align-items: center;
  }
  input {
    margin: 5px 10px;
  }
  button {
    cursor: pointer;
  }
`;
const ChatTitle = styled.div`
  margin: 5px;
  padding: 8px 8px;
  background-color: #f1f1f1;
  border-radius: 25px;
  text-align: center;
  letter-spacing: 1.2;
`;
