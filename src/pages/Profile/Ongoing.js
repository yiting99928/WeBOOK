import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
// import { db } from '../../utils/firebase';
// import { setDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import data from '../../utils/data';
import { AuthContext } from '../../context/authContext';

const Ongoing = () => {
  const [groupData, setGroupData] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function getData() {
      const groupData = await data.loadGroupData(user.email);
      const finishedData = groupData.filter(
        (item) => item.status === 'ongoing'
      );
      setGroupData(finishedData);
    }
    getData();
  }, [user]);
  function formatUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = year + '-' + month + '-' + day;
    return formattedDate;
  }
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        {groupData.length === 0 ? (
          <p>目前沒有進行中的讀書會</p>
        ) : (
          groupData.map((item, i) => (
            <StudyGroupCard key={i}>
              <BookImg imageUrl={item.image} />
              <CardContent>
                <p>
                  書名:<span>{item.name}</span>
                </p>
                <p>
                  作者:<span>{item.author}</span>
                </p>
                <p>
                  導讀者:<span>{item.createBy}</span>
                </p>
                <p>
                  章節:<span>{item.chapter}</span>
                </p>
                <p>
                  創建時間:<span>{formatUnixTimestamp(item.createTime)}</span>
                  {console.log(item.createTime)}
                </p>
                <p>
                  舉辦時間:<span>{item.hold}</span>
                </p>
                <p>公告：{item.post}</p>
                <Link to={`/study-group/${item.id}/live`}>
                  <input type="button" value="進入讀書會直播間" />
                </Link>
              </CardContent>
            </StudyGroupCard>
          ))
        )}
      </Content>
    </Container>
  );
};

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

const StudyGroupCard = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid black;
  line-height: 1.3;
  padding: 10px;
`;
const BookImg = styled.div`
  background-image: url(${(props) => props.imageUrl});
  background-size: contain;
  background-repeat: no-repeat;
  width: 250px;
  height: 200px;
  margin-right: 30px;
  background-position: center;
`;
const CardContent = styled.div`
  width: 800px;
`;
export default Ongoing;
