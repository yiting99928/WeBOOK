import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { GrSearch } from 'react-icons/gr';
import styled from 'styled-components/macro';
import { OutlineBtn } from '../../components/Buttons';
import GroupsLoading from '../../components/GroupsLoading';
import StudyGroupCard from '../../components/StudyGroupCard';
import { categoryOptions } from '../../utils/dataConstants';
import { db } from '../../utils/firebase';
import webookRest from './webookRest.png';

function StudyGroups() {
  const [allGroupsData, setAllGroupsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function getData() {
    const StudyGroupsData = collection(db, 'studyGroups');
    const q = query(
      StudyGroupsData,
      where('status', '!=', 'finished'),
      orderBy('status'),
      orderBy('startTime')
    );

    const groupsSnapshot = await getDocs(q);
    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return groups;
  }
  useEffect(() => {
    setIsLoading(true);
    getData().then((groups) => {
      setAllGroupsData(groups);
      setIsLoading(false);
    });
  }, []);

  const searchByCategory = async (category) => {
    if (category === '全部讀書會') {
      const groups = (await getData()).filter(
        (item) => item.status !== 'finished'
      );
      return groups;
    } else {
      const studyGroupsRef = collection(db, 'studyGroups');
      const q = query(
        studyGroupsRef,
        where('category', '==', category),
        where('status', '!=', 'finished')
      );
      const querySnapshot = await getDocs(q);
      let groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() });
      });
      return groups;
    }
  };

  const handleSearchByCategory = async (category) => {
    if (category === selectedCategory) {
      setSelectedCategory('全部讀書會');
      const groups = (await getData()).filter(
        (item) => item.status !== 'finished'
      );
      setAllGroupsData(groups);
    } else {
      setSelectedCategory(category);
      const groups = await searchByCategory(category);
      setAllGroupsData(groups);
    }
  };

  const searchByText = async (e) => {
    e.preventDefault();
    const studyGroupRef = collection(db, 'studyGroups');

    const searchWords = searchText.split(' ');

    const allGroupsSnapshot = await getDocs(studyGroupRef);
    const allGroups = allGroupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const filteredGroups = allGroups.filter((group) => {
      const groupNameLower = group.name.toLowerCase();
      const hostLower = group.host.toLowerCase();
      const nameLower = group.name.toLowerCase();
      const isNotFinished = group.status !== 'finished';
      return (
        isNotFinished &&
        searchWords.some((word) => {
          const wordLower = word.toLowerCase();
          return (
            groupNameLower.includes(wordLower) ||
            hostLower.includes(wordLower) ||
            nameLower.includes(wordLower)
          );
        })
      );
    });

    setAllGroupsData(filteredGroups);
  };

  function filterGroups(groups, filterOption) {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const filterOptionMap = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      week: new Date(todayStart).setDate(todayStart.getDate() + 7),
      month: new Date(todayStart).setMonth(todayStart.getMonth() + 1),
      twoMonths: new Date(todayStart).setMonth(todayStart.getMonth() + 2),
    };

    if (!Object.keys(filterOptionMap).includes(filterOption)) {
      return groups;
    }

    const endDate = filterOptionMap[filterOption];

    return groups.filter((group) => {
      const groupHoldDate = Timestamp.fromMillis(
        group.startTime.seconds * 1000
      ).toDate();
      return groupHoldDate >= todayStart && groupHoldDate < endDate;
    });
  }

  function handleSelectChange(event) {
    const filterOption = event.target.value;
    getData().then((groups) => {
      const filteredGroups = filterGroups(groups, filterOption);
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
              {categoryOptions.map((category) => (
                <OutlineBtn
                  key={category}
                  onClick={() => handleSearchByCategory(category)}
                  selectedCategory={selectedCategory === category}>
                  {category}
                </OutlineBtn>
              ))}
            </SearchBtns>
          </SearchBar>
        </SearchInputs>
        <BookGroupWrap>
          {isLoading && (
            <>
              <GroupsLoading />
              <GroupsLoading />
              <GroupsLoading />
              <GroupsLoading />
            </>
          )}
          {!isLoading &&
            (allGroupsData.length === 0 ? (
              <NoGroup>
                <img src={webookRest} alt="no data" />
                <p>目前此類別無讀書會</p>
              </NoGroup>
            ) : (
              allGroupsData.map((item, index) => (
                <StudyGroupCard item={item} key={index} />
              ))
            ))}
        </BookGroupWrap>
      </Container>
    </div>
  );
}
const NoGroup = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 200px;
  position: absolute;
  left: 50%;
  margin-top: 50px;
  transform: translateX(-50%);
  letter-spacing: 2px;
  font-size: 18px;
`;
const BookGroupWrap = styled.div`
  position: relative;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 23px;
  margin-top: 40px;
  margin-bottom: 120px;
  ${'' /* padding: 0 20px; */}
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
  height: 32px;
  svg {
    position: absolute;
    right: 10px;
    transform: scale(1.2);
    color: #909090;
    cursor: pointer;
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
  width: 90%;
`;
const SearchBtns = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: -3px;
  width: 90%;
`;
const SearchBtnTitle = styled.div`
  width: 50px;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  margin-top: 60px;
  margin-bottom: 200px;
  padding: 0 20px;
`;
export default StudyGroups;
