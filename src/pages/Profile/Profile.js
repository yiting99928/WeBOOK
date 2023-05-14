import dayjs from 'dayjs';
import parse, { domToReact } from 'html-react-parser';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';
import {
  GuestEditInput,
  HostEditInput,
  OutlineBtn,
} from '../../components/Buttons';
import SideMenu from '../../components/SideMenu';
import { AuthContext } from '../../context/authContext';
import { statusText } from '../../utils/dataConstants';
import data from '../../utils/firebase';
import { formatTimeRange } from '../../utils/formatTime';
import modal from '../../utils/modal';
import webookLogo from './webookLogo.png';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(Array(groupData.length).fill(false));
  const { status } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  async function getData() {
    const groupData = await data.getUserGroup(user.email);
    let filteredData;
    if (!status) {
      const finishedGroups = groupData.filter(
        (group) => group.status === 'finished'
      );
      const otherGroups = groupData.filter(
        (group) => group.status !== 'finished'
      );
      filteredData = [...otherGroups, ...finishedGroups];
    } else {
      filteredData = groupData.filter((item) => item.status === status);
    }
    setGroupData(filteredData);
    setIsLoading(false);
  }

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, [groupData]);

  async function handleQuitGroup(id) {
    await data.quitGroup(id, user);
    modal.quit('已退出這場讀書會!');
    getData();
  }

  async function handleDelGroup(id) {
    try {
      await Promise.all([
        data.delUserGroup(id),
        data.delGroup(id, 'studyGroups'),
      ]);
      modal.quit('已取消這場讀書會!');
      getData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleChangeState(id) {
    try {
      await data.updateGroupStatus(id);
      getData();
    } catch (error) {
      modal.quit(error.message);
    }
  }

  function handleExpanded(index) {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  }

  const ProfileGroupCard = ({ item, index }) => {
    switch (item.status) {
      case 'preparing':
        return (
          <Buttons>
            <GuestEditInput
              isHost={user.email === item.createBy}
              onClick={() => handleQuitGroup(item.id)}>
              退出讀書會
            </GuestEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              onClick={() => handleDelGroup(item.id)}>
              取消讀書會
            </HostEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              onClick={() => navigate(`/study-group/${item.id}/process`)}>
              編輯流程
            </HostEditInput>
            <HostEditInput
              isHost={user.email === item.createBy}
              onClick={() => handleChangeState(item.id)}>
              開始讀書會
            </HostEditInput>
          </Buttons>
        );
      case 'ongoing':
        return (
          <Buttons>
            <Link to={`/study-group/${item.id}/live`}>
              <OutlineBtn>進入直播間</OutlineBtn>
            </Link>
          </Buttons>
        );
      case 'finished':
        return (
          <Buttons>
            <OutlineBtn onClick={() => handleExpanded(index)}>
              讀書會筆記
            </OutlineBtn>
          </Buttons>
        );

      default:
        return null;
    }
  };
  const replace = (node) => {
    if (node.attribs && node.attribs.contenteditable) {
      delete node.attribs.contenteditable;
      return (
        <node.name {...node.attribs}>
          {domToReact(node.children, { replace })}
        </node.name>
      );
    }
  };
  return (
    <SideMenu>
      {isLoading && (
        <div>
          {[...Array(3)].map((_, index) => (
            <LoadingContainer key={index}>
              <LoadingImg />
              <LoadingContent>
                <Info height={'56px'} width={'80%'} />
                <Info height={'56px'} width={'60%'} />
                <Info height={'56px'} width={'200px'} />
                <Info height={'25px'} width={'90px'} />
              </LoadingContent>
            </LoadingContainer>
          ))}
        </div>
      )}

      {!isLoading &&
        (groupData.length === 0 ? (
          <NoData>
            <img src={webookLogo} alt="img" />
            此類別目前無讀書會 <br />
            到全部讀書會逛逛吧~
          </NoData>
        ) : (
          groupData.map((item, index) => {
            const currentTime = dayjs().unix();
            const threeDaysLater = dayjs().add(3, 'days').unix();
            const startTime = item.startTime.seconds;
            const isUpcoming =
              startTime >= currentTime &&
              startTime <= threeDaysLater &&
              item.status === 'preparing';
            return (
              <StudyGroupCard key={index}>
                <GroupInfo expanded={expanded[index]}>
                  <ImgContainer>
                    <BookGroupImg
                      src={item.image}
                      alt="feature"
                      onClick={() => navigate(`/study-group/${item.id}`)}
                    />
                  </ImgContainer>
                  <CardContent>
                    <Title>{item.groupName}</Title>
                    <BookName>{item.name}</BookName>
                    <Creator>
                      導讀人：{item.host}
                      <br />
                      章節：{item.chapter}
                      <br />
                      時間：
                      {formatTimeRange(item.startTime, item.endTime)}
                    </Creator>
                    {<ProfileGroupCard index={index} item={item} />}
                  </CardContent>
                  <Tag>
                    <Status statusColor={statusText[item.status].color}>
                      {statusText[item.status].type}
                    </Status>
                    {isUpcoming && (
                      <Status statusColor={statusText.upcoming.color}>
                        {statusText.upcoming.type}
                      </Status>
                    )}
                  </Tag>
                </GroupInfo>
                {expanded[index] && (
                  <Note>
                    <br />
                    {item.note ? (
                      parse(item.note, { replace })
                    ) : (
                      <NoNote>無讀書會筆記</NoNote>
                    )}
                  </Note>
                )}
              </StudyGroupCard>
            );
          })
        ))}
    </SideMenu>
  );
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const Pulse = styled.div`
  animation: ${pulse} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 248px;
  display: flex;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1.5px solid #ececec;
  align-self: flex-start;
`;

const LoadingImg = styled(Pulse)`
  width: 150px;
  margin-right: 50px;
  background-color: #ececec;
`;

const LoadingContent = styled.div`
  gap: 10px;
  display: flex;
  flex-direction: column;
  width: 600px;
`;
const Info = styled(Pulse)`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
  background-color: #ececec;
  border-radius: 25px;
`;
const NoNote = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;
const NoData = styled.div`
  text-align: center;
  line-height: 1.5;
  font-size: 20px;
  margin: 0 auto;
  img {
    width: 200px;
    height: 200px;
  }
`;
const Note = styled.div`
  border-top: 1px solid #b5b5b5;
  padding-top: 15px;
  line-height: 1.3;
`;
const BookName = styled.div`
  font-size: 24px;
  letter-spacing: 1.5;
  @media screen and (max-width: 640px) {
    font-size: 20px;
  }
`;
const Tag = styled.div`
  margin-left: auto;
  display: flex;
  gap: 5px;
  flex-direction: column;
  @media screen and (max-width: 768px) {
    position: absolute;
    top: 16px;
    right: 20px;
  }
`;
const Status = styled.div`
  text-align: center;
  background-color: ${({ statusColor }) => statusColor};
  color: #fff;
  border-radius: 6px;
  padding: 5px 0px;
  width: 95px;
  cursor: default;
  letter-spacing: 1.3;
  @media screen and (max-width: 768px) {
    color: ${({ statusColor }) => statusColor};
    width: 20px;
    height: 10px;
    overflow: hidden;
    :hover {
      color: #fff;
      overflow: auto;
      width: 95px;
      height: auto;
    }
  }
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 28px;
  letter-spacing: 1.5;
  @media screen and (max-width: 640px) {
    font-size: 24px;
  }
`;
const Buttons = styled.div`
  display: flex;
  gap: 5px;
  @media screen and (max-width: 375px) {
    white-space: nowrap;
    overflow-x: scroll;
    cursor: grab;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }
`;
const ImgContainer = styled.div`
  overflow: hidden;
`;
const BookGroupImg = styled.img`
  width: 150px;
  height: 210px;
  object-fit: cover;
  cursor: pointer;
  :hover {
    transform: scale(1.15);
  }
`;
const GroupInfo = styled.div`
  display: flex;
  gap: 50px;
  padding-bottom: ${({ expanded }) => (expanded ? '30px' : '0px')};
  @media screen and (max-width: 640px) {
    gap: 20px;
    flex-direction: column;
    align-items: center;
  }
`;
const StudyGroupCard = styled.div`
  padding: 16px 20px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 100%;
  position: relative;
  @media screen and (max-width: 640px) {
    max-width: 450px;
  }
`;
const Creator = styled.div`
  margin-top: auto;
  font-size: 14px;
  line-height: 1.5;
`;
const CardContent = styled.div`
  gap: 10px;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  color: #5b5b5b;
  @media screen and (max-width: 640px) {
    width: 100%;
  }
`;
export default Profile;
