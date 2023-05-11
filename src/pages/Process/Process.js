import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { produce } from 'immer';
import React, { useEffect, useReducer, useState } from 'react';
import { BiCopy, BiTrash } from 'react-icons/bi';
import { GrAddCircle } from 'react-icons/gr';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import GroupTitle from '../../components/GroupTitle';
import SideMenu from '../../components/SideMenu';
import { db } from '../../utils/firebaseConfig';
import modal from '../../utils/modal';
import Lecture from './Lecture';
import OptionList from './OptionList';
import StickyNote from './StickyNote';
import move from './move.png';

function reducer(processData, { type, payload = {} }) {
  const { lecture, processIndex, templates, e, data, process } = payload;
  return produce(processData, (draft) => {
    switch (type) {
      case 'INIT_CARD': {
        draft.push(lecture);
        break;
      }
      case 'SET_CARD': {
        return process;
      }
      case 'ADD_CARD': {
        draft.splice(processIndex + 1, 0, lecture);
        break;
      }
      case 'CHANGE_CARD': {
        const newTemplate = templates.find(
          (template) => template.type === e.target.value
        );
        draft[processIndex] = newTemplate;
        break;
      }
      case 'COPY_CARD': {
        const updatedCard = draft[processIndex];
        draft.splice(processIndex + 1, 0, updatedCard);
        break;
      }
      case 'DEL_CARD': {
        draft.splice(processIndex, 1);
        break;
      }
      case 'MOVE_CARD': {
        const { fromIndex, toIndex } = payload;
        const itemToMove = draft[fromIndex];
        draft.splice(fromIndex, 1);
        draft.splice(toIndex, 0, itemToMove);
        break;
      }
      case 'UPDATE_DESCRIPTION': {
        draft[processIndex].description = data;
        break;
      }
      case 'UPDATE_DATA': {
        draft[processIndex].data = data;
        break;
      }
      default:
        throw new Error(`Unknown action: ${type}`);
    }
  });
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
          <StickyNote
            item={item}
            processIndex={processIndex}
            editable={editable}
            dispatch={dispatch}
          />
        );
      case 'vote':
      case 'QA':
        return (
          <OptionList
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

  function areAllQAsValid(processData) {
    return processData.every((item) => {
      if (item.type === 'QA') {
        return item.data.some((option) => option.answer);
      }
      return true;
    });
  }

  function handelSave(processData) {
    if (!areAllQAsValid(processData)) {
      modal.quit('請確認每個QA問答都有選擇正確答案！');
      return;
    }

    setDoc(doc(db, 'studyGroups', id), { ...studyGroup, process: processData })
      .then(() => {
        modal.success('已儲存讀書會流程!');
      })
      .catch((error) => {
        modal.quit('讀書會流程儲存失敗!');
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
      <TitleContainer>
        <GroupTitle studyGroup={studyGroup} />
      </TitleContainer>
      <ProcessContainer>
        {processData !== undefined &&
          processData.map((item, processIndex) => {
            return (
              <ProcessCard
                key={processIndex}
                id={`card-${processIndex}`}
                onClick={() => setEditable(processIndex)}>
                <EditBlock editable={editable === processIndex}></EditBlock>
                <Drag
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, processIndex)}
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, processIndex)}>
                  <img src={move} alt="move" />
                </Drag>
                <></>
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
                        payload: { lecture, processIndex },
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
const TitleContainer = styled.div`
  width: 90%;
`;
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
const ProcessContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 90%;
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
