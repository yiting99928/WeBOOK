import {
  setDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { GrSearch } from 'react-icons/gr';
import modal from '../../utils/modal';
import StudyGroupCard from '../../components/StudyGroupCard';

function StudyGroups() {
  const { user } = useContext(AuthContext);
  const [allGroupsData, setAllGroupsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  async function getData() {
    const StudyGroupsData = collection(db, 'studyGroups');
    const q = query(StudyGroupsData, orderBy('hold'));
    const groupsSnapshot = await getDocs(q);
    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllGroupsData(groups);
    return groups;
  }
  useEffect(() => {
    getData();
  }, []);

  const handleJoinGroup = async (id) => {
    const userGroupRef = doc(db, 'users', user.email, 'userStudyGroups', id);
    await setDoc(userGroupRef, { note: '' }).then(modal.success('已加入讀書會!'));
  };

  const searchByCategory = async (category) => {
    console.log(category);
    if (category === '全部讀書會') {
      const groups = await getData();
      return groups;
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
  const searchByText = async (e) => {
    e.preventDefault();
    const studyGroupRef = collection(db, 'studyGroups');
    const q = query(
      studyGroupRef,
      where('name', '>=', searchText),
      where('name', '<=', searchText + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    let groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    setAllGroupsData(groups);
  };

  function filterGroups(groups, filterOption) {
    if (!['today', 'week', 'month', 'twoMonths'].includes(filterOption)) {
      return groups;
    }
    // 當前的日期與時間
    const now = new Date();
    // 設置今天開始的時間
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    // 計算一週
    const oneWeekLater = new Date(todayStart);
    oneWeekLater.setDate(todayStart.getDate() + 7);
    // 計算一個月後的日期
    const oneMonthLater = new Date(todayStart);
    oneMonthLater.setMonth(todayStart.getMonth() + 1);
    // 計算兩個月後的日期
    const twoMonthsLater = new Date(todayStart);
    twoMonthsLater.setMonth(todayStart.getMonth() + 2);

    return groups.filter((group) => {
      const groupHoldDate = Timestamp.fromMillis(
        group.hold.seconds * 1000
      ).toDate();
      if (filterOption === 'today') {
        const todayEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        return groupHoldDate >= todayStart && groupHoldDate < todayEnd;
      } // 如果選項是 'week'，篩選一周內的組
      else if (filterOption === 'week') {
        return groupHoldDate >= todayStart && groupHoldDate < oneWeekLater;
      }
      // 如果選項是 'month'，篩選一個月內的組
      else if (filterOption === 'month') {
        return groupHoldDate >= todayStart && groupHoldDate < oneMonthLater;
      }
      // 如果選項是 'twoMonths'，篩選兩個月內的組
      else if (filterOption === 'twoMonths') {
        return groupHoldDate >= todayStart && groupHoldDate < twoMonthsLater;
      }
    });
  }

  function handleSelectChange(event) {
    const filterOption = event.target.value;
    getData().then((groups) => {
      const filteredGroups = filterGroups(groups, filterOption);
      console.log(filteredGroups);
      setAllGroupsData(filteredGroups);
    });
  }

  return (
    <div>
      <Container>
        <SearchInputs>
          <SearchBar>
            <SearchText onSubmit={searchByText}>
              <SearchInput
                type="text"
                placeholder="搜尋書籍名稱"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
              />
              <GrSearch onClick={searchByText} />
            </SearchText>
            <SelectInput onChange={handleSelectChange}>
              <option value="all">搜尋舉辦時間</option>
              <option value="today">今天</option>
              <option value="week">一週內</option>
              <option value="month">一個月內</option>
              <option value="twoMonths">兩個月內</option>
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
            allGroupsData.map((item, index) => (
              <StudyGroupCard
                item={item}
                key={index}
                onClick={() => navigate(`/studyGroup/${item.id}`)}
                onJoinGroup={handleJoinGroup}
              />
            ))
          )}
        </BookGroupWrap>
      </Container>
    </div>
  );
}
const BookGroupWrap = styled.div`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 23px;
  margin-top: 40px;
  margin-bottom: 120px;
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
const SearchText = styled.form`
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
  padding: 8px 12px;
`;
const SearchBtns = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
const SearchBtn = styled.input`
  padding: 5px 10px;
  border: 2px solid #ffac4c;
  border-radius: 5px;
  background-color: white;
  color: #ffac4c;
`;
const SearchBtnTitle = styled.div`
  width: 50px;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  margin-top: 60px;
  margin-bottom: 200px;
`;
export default StudyGroups;
