import React, { useState, useEffect, useContext } from 'react';
// import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import data from '../../utils/api';
import { AuthContext } from '../../context/authContext';
import moment from 'moment';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState([]);

  // const { status } = useParams();
  // console.log(status);

  useEffect(() => {
    if (user) {
      async function getData() {
        const groupData = await data.fetchUserGroup(user.email);
        setGroupData(groupData);
      }
      getData();
    }
  }, [user]);

  // const renderCardContent = (item) => {
  //   console.log(item);
  //   switch (status) {
  //     case undefined:
  //       return (
  //         <>
  //         </>
  //       );
  //     // case 'ongoing':
  //     //   return <></>;
  //     // case 'preparing':
  //     //   return <></>;
  //     // case 'finished':
  //     //   return <></>;
  //     default:
  //       return <></>;
  //   }
  // };

  const statusText = {
    ongoing: '進行中',
    preparing: '準備中',
    finished: '已結束',
  };
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        {groupData.map((item, i) => (
          <StudyGroupCard key={i}>
            <BookGroupImg>
              <img src={item.image} alt="feature" />
            </BookGroupImg>
            <CardContent>
              <Title>{item.name}</Title>
              <p>作者:{item.author}</p>
              <Creator>
                導讀者:{item.createBy}
                <br />
                章節:{item.chapter}
                <br />
                舉辦時間:
                {moment.unix(item.hold.seconds).format('YYYY,MM,DD hh:mm A')}
              </Creator>
            </CardContent>
            <Status>{statusText[item.status]}</Status>
          </StudyGroupCard>
        ))}
      </Content>
    </Container>
  );
};
const Title = styled.div`
  font-weight: 600;
  font-size: 32px;
  letter-spacing: 0.05em;
`;
const Status = styled.div`
  background-color: #df524d;
  padding: 5px 16px;
  margin-left: auto;
  color: #fff;
  border-radius: 6px;
`;
const BookGroupImg = styled.div`
  max-width: 180px;
`;
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

const StudyGroupCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 50px;
  padding: 16px 20px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;
const Creator = styled.div`
  margin-top: auto;
  line-height: 1.5;
`;
const CardContent = styled.div`
  gap: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 600px;
`;
export default Profile;
