import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { IoIosArrowForward } from "react-icons/io";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../context/authContext";
import data from "../../utils/firebase";
import { db } from "../../utils/firebaseConfig";

const Message = () => {
	const { id } = useParams();
	const { email } = useContext(AuthContext).user;
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "start",
		});
	}, [messages]);

	useEffect(() => {
		const chatRoomRef = collection(db, "rooms", id, "messages");
		const q = query(chatRoomRef, orderBy("timestamp", "asc"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			setMessages(snapshot.docs.map((doc) => doc.data()));
		});

		return () => {
			unsubscribe();
		};
	}, [id]);

	return (
		<MessageStyled>
			{messages.map(({ sender, message, sanderImg, senderName }, index) => {
				if (sender === null)
					return <SystemMessage key={index}>{message}</SystemMessage>;
				if (email === sender)
					return <UserMessage key={index}>{message}</UserMessage>;
				return (
					<GuestMessage key={index}>
						<UserImg src={sanderImg} alt="userImg" />
						<SenderMessage>
							<SenderName>{senderName}</SenderName>
							<p>{message}</p>
						</SenderMessage>
					</GuestMessage>
				);
			})}
			<div ref={messagesEndRef} />
		</MessageStyled>
	);
};

const Chat = () => {
	const { id } = useParams();
	const { email, name, userImg } = useContext(AuthContext).user;
	const [messageInput, setMessageInput] = useState("");

	const sendMessage = useCallback(
		async (e) => {
			e.preventDefault();
			const trimmedMessage = messageInput.trim();

			if (trimmedMessage) {
				await data.addMessage(id, {
					message: trimmedMessage,
					timestamp: new Date(),
					sender: email,
					senderName: name,
					sanderImg: userImg,
				});
				setMessageInput("");
			}
		},
		[messageInput]
	);

	return (
		<ChatInput>
			<form onSubmit={sendMessage}>
				<input
					value={messageInput}
					onChange={(e) => setMessageInput(e.target.value)}
				/>
				<button type="submit">
					<IoIosArrowForward />
				</button>
			</form>
		</ChatInput>
	);
};

export const ChatRoom = React.memo(({ showChatRoom }) => (
	<ChatRoomContainer showChatRoom={showChatRoom}>
		<ChatTitle>聊天室</ChatTitle>
		<Message />
		<Chat />
	</ChatRoomContainer>
));

const SenderMessage = styled.div`
	background-color: #f1f1f1;
	padding: 5px 10px;
	border-radius: 6px;
`;
const ChatRoomContainer = styled.div`
	box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
	display: ${({ showChatRoom }) => (showChatRoom ? "flex" : "none")};
	flex-direction: column;
	border-radius: 6px;
	overflow: hidden;
	width: 230px;
	height: 500px;
	background-color: #fff;
	@media screen and (max-width: 1024px) {
		height: 400px;
	}
	@media screen and (max-width: 768px) {
		position: fixed;
		right: 10px;
		bottom: 70px;
		height: 450px;
		z-index: 2;
	}
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
const MessageStyled = styled.div`
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
	position: relative;
	form {
		width: 100%;
		display: flex;
		align-items: center;
	}
	input {
		margin: 5px 10px;
		width: 100%;
	}
	button {
		cursor: pointer;
		position: absolute;
		right: 10px;
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
