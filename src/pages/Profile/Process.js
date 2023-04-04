import React, { useState, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;
const Content = styled.div`
  flex: 1;
  background-color: #f2f2f2;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${(props) => (props.isOpen ? 'calc(100% - 200px)' : '100%')};
`;
const ProcessCard = styled.div`
  border: 1px solid black;
  padding: 10px;
  cursor: pointer;
`;

function reducer(processData, { type, payload }) {
  const { lecture, processIndex, templates, e } = payload;
  switch (type) {
    case 'SET_CARD':
      return [{ ...lecture }];
    case 'ADD_CARD':
      return [...processData, { ...lecture }];
    case 'CHANGE_CARD':
      return processData.map((card, cardIndex) => {
        if (cardIndex === processIndex) {
          const newTemplate = templates.find(
            (template) => template.type === e.target.value
          );
          return { ...newTemplate };
        }
        return card;
      });
    case 'COPY_CARD':
      const cardToCopy = processData[processIndex];
      return [
        ...processData.slice(0, processIndex + 1),
        { ...cardToCopy },
        ...processData.slice(processIndex + 1),
      ];
    case 'DEL_CARD':
      const newData = [...processData];
      newData.splice(processIndex, 1);
      return newData;
    case 'MOVE_CARD':
      const { fromIndex, toIndex } = payload;
      const itemToMove = processData[fromIndex];
      const updatedData = [...processData];
      updatedData.splice(fromIndex, 1);
      updatedData.splice(toIndex, 0, itemToMove);
      return updatedData;
    default:
      throw new Error(`Unknown action: ${type}`);
  }
}
function Process() {
  const [processData, dispatch] = useReducer(reducer, []);
  const [templates, setTemplates] = useState([]);
  const [studyGroup, setStudyGroup] = useState({});

  const { id } = useParams();
  useEffect(() => {
    getDoc(doc(db, 'studyGroups', id)).then((doc) => {
      setStudyGroup(doc.data());
    });

    getDocs(collection(db, 'template')).then((snapshot) => {
      const templatesData = snapshot.docs.map((doc) => doc.data());
      setTemplates(templatesData);
      const lecture = templatesData.find((item) => item.type === 'lecture');
      dispatch({ type: 'SET_CARD', payload: { lecture } });
    });
  }, []);

  const renderCardContent = (item) => {
    switch (item.type) {
      case 'lecture':
        return (
          <div>
            <p>這是導讀講稿的文字內容</p>
          </div>
        );
      case 'extension':
        return (
          <div>
            <p>這是衍伸分享的書籍內容</p>
            <p>這是衍伸分享的文字內容</p>
          </div>
        );
      case 'stickyNote':
        return (
          <div>
            <p>這是便利貼分享message</p>
            <p>這是便利貼分享user</p>
          </div>
        );
      case 'QA':
        return (
          <div>
            <input type="radio" name="option" />
            <label htmlFor="choose">選項一</label>
            <input type="radio" name="option" />
            <label htmlFor="choose">選項一</label>
            <input type="radio" name="option" />
            <label htmlFor="choose">選項一</label>
            <input type="radio" name="option" />
            <label htmlFor="choose">選項一</label>
            <hr />
            <div>答案</div>
          </div>
        );
      case 'vote':
        return (
          <div>
            <input type="radio" name="option" />
            <label htmlFor="choose">選項一</label>
            <p>0票</p>
            <input type="radio" name="option" />
            <label htmlFor="choose">選項一</label>
            <p>0票</p>
          </div>
        );
      default:
        return null;
    }
  };
  function handleDragStart(processIndex) {
    return (e) => {
      e.dataTransfer.setData('text/plain', processIndex);
    };
  }

  function handleDragOver() {
    return (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };
  }

  function handleDrop(processIndex) {
    return (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      dispatch({
        type: 'MOVE_CARD',
        payload: { fromIndex, toIndex: processIndex },
      });
    };
  }

  console.log(studyGroup.process);
  console.log(processData);
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        <h2>書名：{studyGroup.name}</h2>
        <p>
          作者：{studyGroup.author}
          <span>舉辦時間：{studyGroup.hold}</span>
        </p>
        <div>
          {processData !== undefined &&
            processData.map((item, processIndex) => {
              return (
                <ProcessCard
                  key={processIndex}
                  draggable="true" // 設定元素可被拖曳
                  onDragStart={handleDragStart(processIndex)} // 拖曳開始
                  onDragOver={handleDragOver()} // 拖曳進行中
                  onDrop={handleDrop(processIndex)} // 拖曳放開執行
                >
                  <p>{item.type}</p>
                  <hr />
                  <p>{item.description}</p>
                  <select
                    name="templateType"
                    value={item.type}
                    onChange={(e) =>
                      dispatch({
                        type: 'CHANGE_CARD',
                        payload: {
                          processIndex: processIndex,
                          templates: templates,
                          e: e,
                        },
                      })
                    }>
                    <option value="lecture">導讀講稿</option>
                    <option value="extension">衍伸分享</option>
                    <option value="stickyNote">便利貼分享</option>
                    <option value="QA">QA問答</option>
                    <option value="vote">問題票選</option>
                  </select>
                  <input
                    type="button"
                    value="新增流程"
                    onClick={() => {
                      const lecture = templates.find(
                        (item) => item.type === 'lecture'
                      );
                      dispatch({ type: 'ADD_CARD', payload: { lecture } });
                    }}
                  />
                  {renderCardContent(item)}
                  <input
                    type="button"
                    value="複製"
                    onClick={() => {
                      dispatch({
                        type: 'COPY_CARD',
                        payload: { processIndex },
                      });
                    }}
                  />
                  <input
                    type="button"
                    value="刪除"
                    onClick={() => {
                      dispatch({ type: 'DEL_CARD', payload: { processIndex } });
                    }}
                  />
                </ProcessCard>
              );
            })}
        </div>
      </Content>
    </Container>
  );
}
export default Process;
