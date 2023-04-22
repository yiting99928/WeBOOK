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
import { GrSearch } from 'react-icons/gr';
import moment from 'moment';
import bookImg from './bookImg.jpg';

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

  function toReadableDate(dateString) {
    const dateObj = moment(dateString, 'YYYY年M月D日 ah:mm', 'zh-TW');
    const formattedDate = dateObj.format('YYYY.MM.DD h:mmA');

    return formattedDate;
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

  return (
    <div>
      <Container>
        <SearchInputs>
          <SearchBar>
            <SearchText>
              <SearchInput type="text" placeholder="搜尋" onClick={() => {}} />
              <GrSearch />
            </SearchText>
            <SelectInput>
              <option>搜尋舉辦時間</option>
              <option>今天</option>
              <option>一週內</option>
              <option>一個月內</option>
              <option>兩個月內</option>
            </SelectInput>
          </SearchBar>
          <SearchBar>
            <SearchBtnTitle>類別</SearchBtnTitle>
            <SearchBtns>
              <SearchBtn
                type="button"
                value="全部讀書會"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="文學小說"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="商業理財"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="藝術設計"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="醫療保健"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="言情小說"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="社會科學"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="生活風格"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="勵志成長"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="自然科普"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="旅遊觀光"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="宗教"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="漫畫"
                onClick={handleSearchByCategory}
              />
              <SearchBtn
                type="button"
                value="科技"
                onClick={handleSearchByCategory}
              />
            </SearchBtns>
          </SearchBar>
        </SearchInputs>
        <BookGroupWrap>
          {allGroupsData.length === 0 ? (
            <>目前此類別讀書會</>
          ) : (
            allGroupsData.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(`/studyGroup/${card.id}`)}>
                <BookGroup key={index}>
                  <BookGroupImg>
                    <img src={card.image} alt="feature" />
                  </BookGroupImg>
                  <BookGroupInfo>
                    <BookTitle>{card.name}</BookTitle>
                    <BookAuthor>{card.author}</BookAuthor>
                    <Creator>
                      舉辦時間：{toReadableDate(card.hold)}
                      <br />
                      導讀者：{card.host}
                    </Creator>
                    <GroupButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(card.id);
                      }}>
                      加入讀書會
                    </GroupButton>
                  </BookGroupInfo>
                </BookGroup>
              </div>
            ))
          )}
          <BookGroup>
            <BookGroupImg>
              <img src={bookImg} alt="feature" />
            </BookGroupImg>
            <BookGroupInfo>
              <BookTitle>如何成為不完美主義者</BookTitle>
              <BookAuthor>史帝芬 蓋斯</BookAuthor>
              <Creator>
                舉辦時間：2023.05.06 6:00AM <br />
                導讀人：Yumy
              </Creator>
              <GroupButton>加入讀書會</GroupButton>
            </BookGroupInfo>
          </BookGroup>
        </BookGroupWrap>
      </Container>
    </div>
  );
}
const BookGroupWrap = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, 280px);
  gap: 25px;
  margin-top: 80px;
  margin-bottom: 120px;
`;
const BookGroupImg = styled.div`
  width: 280px;
`;
const BookGroupInfo = styled.div`
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 15px;
`;
const BookGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 280px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #ececec;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
const GroupButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background: #ffac4c;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  letter-spacing: 1.2;
  font-size: 18px;
  margin-top: 8px;
`;

const BookTitle = styled.div`
  padding-bottom: 4px;
  font-weight: 600;
  font-size: 20px;
`;
const BookAuthor = styled.div`
  color: #5b5b5b;
  padding-top: 6px;
  font-size: 14px;
`;
const Creator = styled.div`
  font-size: 16px;
  margin-top: auto;
  line-height: 1.3;
`;
const SearchBar = styled.div`
  display: flex;
  gap: 10px;
`;
const SearchInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
`;
const SearchText = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid #909090;
  display: flex;
  align-items: center;
  border-radius: 4px;
  svg {
    position: absolute;
    right: 10px;
    transform: scale(1.2);
    color: #909090;
  }
`;
const SelectInput = styled.select`
  padding: 0 8px;
  width: 200px;
  height: 32px;
  border: 1px solid #909090;
  border-radius: 4px;
`;
const SearchInput = styled.input`
  height: 32px;
  padding: 8px 12px;
  width: 100%;
`;
const SearchBtns = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 1000px;
`;
const SearchBtn = styled.input`
  width: 86px;
  height: 32px;
  border: 2px solid #ffac4c;
  border-radius: 5px;
  background-color: white;
  color: #ffac4c;
`;
const SearchBtnTitle = styled.div``;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  ${'' /* margin: 0 auto; */}
  ${'' /* margin: 60px; */}
`;
export default StudyGroups;
