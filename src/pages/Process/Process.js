import React, { useState, useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import Lecture from './Lecture';
import StickyNote from './StickyNote';
import Vote from './Vote';
import QA from './QA';

function reducer(processData, { type, payload = {} }) {
  const { lecture, processIndex, templates, e, description, data, process } =
    payload;
  switch (type) {
    case 'INIT_CARD': {
      return [{ ...lecture }];
    }
    case 'SET_CARD': {
      return [...process];
    }
    case 'ADD_CARD': {
      return [...processData, { ...lecture }];
    }
    case 'CHANGE_CARD': {
      return processData.map((card, cardIndex) => {
        if (cardIndex === processIndex) {
          const newTemplate = templates.find(
            (template) => template.type === e.target.value
          );
          return { ...newTemplate };
        }
        return card;
      });
    }
    case 'COPY_CARD': {
      const updatedCard = processData[processIndex];
      return [
        ...processData.slice(0, processIndex + 1),
        { ...updatedCard },
        ...processData.slice(processIndex + 1),
      ];
    }
    case 'DEL_CARD': {
      const updatedCard = [...processData];
      updatedCard.splice(processIndex, 1);
      return updatedCard;
    }
    case 'MOVE_CARD': {
      const { fromIndex, toIndex } = payload;
      const itemToMove = processData[fromIndex];
      const updatedCard = [...processData];
      updatedCard.splice(fromIndex, 1);
      updatedCard.splice(toIndex, 0, itemToMove);
      return updatedCard;
    }
    case 'UPDATE_DESCRIPTION': {
      const updatedCard = processData.map((card, index) => {
        if (index === processIndex) {
          return { ...card, description: description };
        }
        return card;
      });
      return updatedCard;
    }
    case 'UPDATE_DATA': {
      const updatedCard = processData.map((card, index) => {
        if (index === processIndex) {
          return { ...card, data };
        }
        return card;
      });
      return updatedCard;
    }
    default:
      throw new Error(`Unknown action: ${type}`);
  }
}

function Process() {
  const [processData, dispatch] = useReducer(reducer, []);
  const [templates, setTemplates] = useState([]);
  const [studyGroup, setStudyGroup] = useState({});
  const [editable, setEditable] = useState(0);
  const { id } = useParams();
  // console.log(studyGroup)
  useEffect(() => {
    async function initData() {
      try {
        const studyGroupRef = doc(db, 'studyGroups', id);
        const studyGroupSnapshot = await getDoc(studyGroupRef);
        const studyGroupData = studyGroupSnapshot.data();
        setStudyGroup(studyGroupData);

        const templatesCollectionRef = collection(db, 'templates');
        const templatesSnapshot = await getDocs(templatesCollectionRef);
        const templatesData = templatesSnapshot.docs.map((doc) => doc.data());
        setTemplates(templatesData);
        if (studyGroupData.process === undefined) {
          const lecture = templatesData.find((item) => item.type === 'lecture');
          dispatch({ type: 'INIT_CARD', payload: { lecture } });
        } else {
          const process = studyGroupData.process;
          dispatch({ type: 'SET_CARD', payload: { process } });
        }
      } catch (error) {
        console.error(error);
      }
    }

    initData();
  }, [id]);

  const renderCardContent = (item, processIndex) => {
    switch (item.type) {
      case 'lecture':
        return (
          <Lecture
            item={item}
            processIndex={processIndex}
            editable={editable}
            dispatch={dispatch}
          />
        );
      case 'stickyNote':
        return (
          <StickyNote
            item={item}
            processIndex={processIndex}
            editable={editable}
            dispatch={dispatch}
          />
        );
      case 'QA':
        return (
          <QA
            item={item}
            processIndex={processIndex}
            editable={editable}
            dispatch={dispatch}
          />
        );
      case 'vote':
        return (
          <Vote
            item={item}
            processIndex={processIndex}
            editable={editable}
            dispatch={dispatch}
          />
        );
      default:
        return (
          <Lecture
            item={item}
            processIndex={processIndex}
            editable={editable}
            dispatch={dispatch}
          />
        );
    }
  };
  const handleDragStart = (e, processIndex) => {
    e.dataTransfer.setData('text/plain', processIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, processIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    dispatch({
      type: 'MOVE_CARD',
      payload: { fromIndex, toIndex: processIndex },
    });
    setEditable(processIndex);
  };

  function handelSave(processData) {
    setDoc(doc(db, 'studyGroups', id), { ...studyGroup, process: processData })
      .then(() => {
        console.log('Process data saved successfully.');
        alert('已儲存讀書會流程');
      })
      .catch((error) => {
        console.error('Error while saving process data: ', error);
      });
  }

  // const handleOptionBlur = (processIndex, e) => {
  //   const updatedData = [...item.data];
  //   updatedData[processIndex].option = e.target.innerText;
  //   dispatch({
  //     type: 'UPDATE_DESCRIPTION',
  //     payload: { processIndex, data: updatedData },
  //   });
  // };

  // console.log(processData);
  return (
    <>
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
                    editable={editable === processIndex}
                    onClick={() => setEditable(processIndex)}>
                    <div
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, processIndex)}
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={(e) => handleDrop(e, processIndex)}>
                      MOVE
                    </div>
                    <Title>
                      {/* <div
                        dangerouslySetInnerHTML={{ __html: item.description }}
                        contentEditable={editable === processIndex}
                        onBlur={(e) => handleOptionBlur(processIndex, e)}
                        onInput={(e)=>e.stopPropagation()}
                      /> */}
                      <input
                        readOnly={editable === processIndex ? false : true}
                        value={item.description}
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_DESCRIPTION',
                            payload: {
                              description: e.target.value,
                              processIndex,
                            },
                          });
                        }}
                      />
                      <TemplateType
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
                        <option value="stickyNote">便利貼分享</option>
                        <option value="QA">QA問答</option>
                        <option value="vote">問題票選</option>
                      </TemplateType>
                    </Title>

                    {renderCardContent(item, processIndex)}
                    <Buttons editable={editable === processIndex}>
                      <input
                        type="button"
                        value="新增"
                        onClick={() => {
                          const lecture = templates.find(
                            (item) => item.type === 'lecture'
                          );
                          dispatch({ type: 'ADD_CARD', payload: { lecture } });
                        }}
                      />
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
                          dispatch({
                            type: 'DEL_CARD',
                            payload: { processIndex },
                          });
                        }}
                      />
                    </Buttons>
                  </ProcessCard>
                );
              })}
          </div>
          <input
            type="button"
            value="儲存"
            onClick={() => handelSave(processData)}
          />
        </Content>
      </Container>
    </>
  );
}
const Buttons = styled.div`
  display: ${({ editable }) => (editable ? 'block' : 'none')};
`;
const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 10px;
  border-bottom: 1px solid black;
`;
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;
const Content = styled.div`
  flex: 1;
  transition: all 0.3s ease;
  padding: 20px;
  width: ${({ isOpen }) => (isOpen ? 'calc(100% - 200px)' : '100%')};
`;
const ProcessCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: ${({ editable }) => (editable ? '1px solid red' : '1px solid black')};
  padding: 10px;
`;
const TemplateType = styled.select`
  height: 25px;
`;
export default Process;
