import {
  setDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

function StudyGroups() {
  const [allGroupsData, setAllGroupsData] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    async function getData() {
      const StudyGroupsData = collection(db, 'studyGroups');
      const groupsSnapshot = await getDocs(StudyGroupsData);
      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(groups);
      setAllGroupsData(groups);
    }
    getData();
  }, []);
  const handleJoinGroup = async (id) => {
    const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { note: '' }).then(alert('已加入讀書會'));
  };
  function toReadableDate(dateString, locale = 'zh-TW') {
    const dateObj = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  }

  const searchByCategory = async (category) => {
    if (category === '全部讀書會') {
      const StudyGroupsData = collection(db, 'studyGroups');
      const groupsSnapshot = await getDocs(StudyGroupsData);
      const groups = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(groups);
      setAllGroupsData(groups);
    } else {
      const studyGroupsRef = collection(db, 'studyGroups');
      const q = query(studyGroupsRef, where('category', '==', category));
      const querySnapshot = await getDocs(q);
      let groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });
      return groups;
    }
  };
  const handleSearchByCategory = async (event) => {
    const groups = await searchByCategory(event.target.value);
    setAllGroupsData(groups);
  };
  // useEffect(() => {
  //   handleSearchByCategory();
  // }, []);
  return (
    <Container>
      <SearchInputs>
        <SearchBar>
          <SearchInput type="text" placeholder="搜尋" onClick={() => {}} />
          <SearchInput type="button" value="搜" onClick={() => {}} />
        </SearchBar>
        <SearchBtns>
          <input
            type="button"
            value="全部讀書會"
            onClick={handleSearchByCategory}
          />
          <input type="button" value="最新創辦" onClick={() => {}} />
          <input type="button" value="即將開始" onClick={() => {}} />
          <input
            type="button"
            value="文學小說"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="商業理財"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="藝術設計"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="醫療保健"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="言情小說"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="社會科學"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="生活風格"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="勵志成長"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="自然科普"
            onClick={handleSearchByCategory}
          />
          <input
            type="button"
            value="旅遊觀光"
            onClick={handleSearchByCategory}
          />
          <input type="button" value="宗教" onClick={handleSearchByCategory} />
          <input type="button" value="漫畫" onClick={handleSearchByCategory} />
          <input type="button" value="科技" onClick={handleSearchByCategory} />
        </SearchBtns>
      </SearchInputs>
      <BookContainer>
        {allGroupsData.length === 0 ? (
          <>目前此類別讀書會</>
        ) : (
          allGroupsData.map((card, index) => (
            <div key={index} onClick={() => navigate(`/studyGroup/${card.id}`)}>
              <Card key={index}>
                <BookImg imageUrl={card.image} />
                <h3>{card.name}</h3>
                <p>{card.category}</p>
                <p>{card.author}</p>
                <p>舉辦時間：{toReadableDate(card.hold)}</p>
                <p>導讀者：{card.host}</p>
                <input
                  type="button"
                  value="加入讀書會"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinGroup(card.id);
                  }}
                />
              </Card>
            </div>
          ))
        )}
      </BookContainer>
    </Container>
  );
}
const SearchBar = styled.div`
  display: flex;
`;
const SearchInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
`;
const SearchInput = styled.input`
  height: 30px;
`;
const SearchBtns = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 700px;
`;
const BookImg = styled.div`
  background-image: url(${(props) => props.imageUrl});
  background-size: contain;
  background-repeat: no-repeat;
  width: 200px;
  height: 250px;
  margin-right: 30px;
  background-position: center;
`;

const BookContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
`;
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
`;

const Card = styled.div`
  cursor: pointer;
  width: 250px;
  height: 450px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    margin-top: 8px;
    font-weight: bold;
  }

  p {
    font-size: 14px;
  }
`;
export default StudyGroups;
