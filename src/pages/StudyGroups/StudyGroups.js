import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { GrSearch } from 'react-icons/gr';
import styled from 'styled-components/macro';
import { OutlineBtn } from '../../components/Buttons';
import GroupsLoading from '../../components/GroupsLoading';
import StudyGroupCard from '../../components/StudyGroupCard';
import { categoryOptions } from '../../utils/dataConstants';
import data from '../../utils/firebase';
import webookRest from './webookRest.png';

function StudyGroups() {
  const [allGroupsData, setAllGroupsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    data.getUnfinishedGroups().then((groups) => {
      setAllGroupsData(groups);
      setIsLoading(false);
    });
  }, []);

  const handleSearchByCategory = async (category) => {
    let groups;
    if (category === '全部讀書會') {
      groups = await data.getUnfinishedGroups();
    } else {
      groups = await data.getCategory(category);
    }

    setSelectedCategory(category);
    setAllGroupsData(groups);
  };

  const searchByText = async (e) => {
    e.preventDefault();

    const groups = await data.getUnfinishedGroups();
    const searchPattern = new RegExp(searchText, 'i');

    const filteredGroups = groups.filter((group) => {
      return (
        searchPattern.test(group.groupName) ||
        searchPattern.test(group.host) ||
        searchPattern.test(group.name)
      );
    });
    setSelectedCategory('');
    setAllGroupsData(filteredGroups);
  };

  function filterGroups(groups, filterOption) {
    const todayStart = dayjs().startOf('day');

    const filterOptionMap = {
      today: todayStart.add(1, 'day'),
      week: todayStart.add(1, 'week'),
      month: todayStart.add(1, 'month'),
      twoMonths: todayStart.add(2, 'month'),
    };

    if (!Object.keys(filterOptionMap).includes(filterOption)) {
      return groups;
    }

    const endDate = filterOptionMap[filterOption];

    return groups.filter((group) => {
      const groupHoldDate = dayjs.unix(group.startTime.seconds);
      return (
        groupHoldDate.isAfter(todayStart) && groupHoldDate.isBefore(endDate)
      );
    });
  }

  function handleSelectChange(event) {
    const filterOption = event.target.value;
    data.getUnfinishedGroups().then((groups) => {
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
  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media screen and (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 0px 20px;
  }
  @media screen and (max-width: 375px) {
    grid-template-columns: repeat(1, 1fr);
    padding: 0px 40px;
  }
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
  overflow-x: scroll;
  cursor: grab;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  @media screen and (max-width: 640px) {
    flex-wrap: nowrap;
    white-space: nowrap;
  }
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
