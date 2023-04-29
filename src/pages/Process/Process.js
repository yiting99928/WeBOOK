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
import move from './move.png';
import { GrAddCircle } from 'react-icons/gr';
import { BiTrash, BiCopy } from 'react-icons/bi';
import moment from 'moment';
import modal from '../../utils/modal';


function reducer(processData, { type, payload = {} }) {
  const { lecture, processIndex, templates, e, data, process } = payload;
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
          return { ...card, description: data };
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
          <>
            <StickyNote
              item={item}
              processIndex={processIndex}
              editable={editable}
              dispatch={dispatch}
            />
          </>
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
    if (editable !== processIndex) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', processIndex);

    // const currentCard = document.getElementById(`card-${processIndex}`);
    // const inputs = currentCard.querySelectorAll('input,div');
    // inputs.forEach((input) => {
    //   input.readOnly = true;
    // });
    // const qlEditors = currentCard.querySelectorAll('.ql-editor');
    // qlEditors.forEach((editor) => {
    //   editor.contentEditable = 'false';
    // });
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

    // if (fromIndex !== processIndex) {
    //   const currentCard = document.getElementById(`card-${processIndex}`);
    //   const inputs = currentCard.querySelectorAll('input');
    //   inputs.forEach((input) => {
    //     input.readOnly = false;
    //   });

    //   const qlEditors = currentCard.querySelectorAll('.ql-editor');
    //   qlEditors.forEach((editor) => {
    //     editor.contentEditable = 'true';
    //   });
    // }
  };

  function handelSave(processData) {
    setDoc(doc(db, 'studyGroups', id), { ...studyGroup, process: processData })
      .then(() => {
        // console.log('Process data saved successfully.');
        modal.success('已儲存讀書會流程!');
      })
      .catch((error) => {
        modal.fail('讀書會流程儲存失敗!');
        // console.error('Error while saving process data: ', error);
      });
  }

  const handleDescriptionChange = (processIndex, e) => {
    const updatedDescription = e.target.value;
    dispatch({
      type: 'UPDATE_DESCRIPTION',
      payload: { processIndex, data: updatedDescription },
    });
  };
  return (
    <SideMenu>
      <GroupTitle>
        <GroupBook>{studyGroup.name}</GroupBook>
        <GroupDetail>
          作者：{studyGroup.author}
          <br />
          導讀章節:{studyGroup.chapter}
          <br />
          舉辦時間:
          {studyGroup && studyGroup.startTime ? (
            moment
              .unix(studyGroup.startTime.seconds)
              .format('YYYY-MM-DD hh:mm A')
          ) : (
            <div>loading</div>
          )}
        </GroupDetail>
      </GroupTitle>
      <ProcessContainer>
        {processData !== undefined &&
          processData.map((item, processIndex) => {
            return (
              <ProcessCard
                key={processIndex}
                id={`card-${processIndex}`} // 添加此行
                onClick={() => setEditable(processIndex)}>
                <EditBlock editable={editable === processIndex}></EditBlock>
                <Drag
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, processIndex)}
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, processIndex)}>
                  <img src={move} alt="move" />
                </Drag>
                <Title>
                  <Description
                    readOnly={editable !== processIndex}
                    onChange={(e) => handleDescriptionChange(processIndex, e)}
                    value={item.description}
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
                  <GrAddCircle
                    onClick={() => {
                      const lecture = templates.find(
                        (item) => item.type === 'lecture'
                      );
                      dispatch({
                        type: 'ADD_CARD',
                        payload: { lecture },
                      });
                    }}
                  />
                  <BiCopy
                    onClick={() => {
                      dispatch({
                        type: 'COPY_CARD',
                        payload: { processIndex },
                      });
                    }}
                  />
                  <BiTrash
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
      </ProcessContainer>
      <SubmitInput onClick={() => handelSave(processData)}>儲存</SubmitInput>
    </SideMenu>
  );
}

const SubmitInput = styled.div`
  background: #df524d;
  border-radius: 6px;
  padding: 10px 80px;
  text-align: center;
  color: #fff;
  margin-top: 20px;
  font-size: 18px;
  letter-spacing: 1.5;
  align-self: center;
  cursor: pointer;
`;
const Description = styled.input`
  font-size: 20px;
  width: 80%;
`;

const Drag = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: grab;
  img {
    width: 28px;
  }
  :active {s
    cursor: grabbing;
  }
`;
const GroupDetail = styled.div``;
const GroupTitle = styled.div`
  display: flex;
  align-items: flex-start;
  color: #5b5b5b;
  gap: 20px;
  margin-bottom: 40px;
  line-height: 1.2;
  justify-content: space-between;
`;
const GroupBook = styled.h2`
  font-weight: 600;
  font-size: 40px;
`;
const ProcessContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const Buttons = styled.div`
  display: ${({ editable }) => (editable ? 'flex' : 'none')};
  position: absolute;
  right: -50px;
  top: 0px;
  flex-direction: column;
  align-items: center;
  background-color: #ececec;
  border-radius: 8px;
  padding: 12px;
  gap: 20px;
  svg {
    transform: scale(1.3);
    cursor: pointer;
  }
`;
const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #5b5b5b;
  margin-bottom: 10px;
  gap: 10px;
`;
const ProcessCard = styled.div`
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 30px;
`;
const EditBlock = styled.div`
  position: absolute;
  background-color: #df524d;
  left: 0px;
  top: 0px;
  width: 10px;
  height: 100%;
  opacity: ${({ editable }) => (editable ? 1 : 0)};
  border-radius: 6px 0px 0px 6px;
`;
const TemplateType = styled.select`
  padding: 0 8px;
  width: 150px;
  height: 32px;
  border: 1px solid #909090;
  border-radius: 4px;
`;
export default Process;
