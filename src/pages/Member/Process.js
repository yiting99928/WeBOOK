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
`;

const initialState = {
  studyGroup: {},
  templates: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STUDY_GROUP':
      return { ...state, studyGroup: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'UPDATE_STUDY_GROUP_PROCESS':
      return {
        ...state,
        studyGroup: { ...state.studyGroup, process: action.payload },
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
function Process() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { id } = useParams();
  useEffect(() => {
    getDoc(doc(db, 'studyGroups', id)).then((doc) => {
      if (doc.exists()) {
        dispatch({ type: 'SET_STUDY_GROUP', payload: doc.data() });
      } else {
        console.log('No such document!');
      }
    });

    getDocs(collection(db, 'template')).then((snapshot) => {
      const templatesData = snapshot.docs.map((doc) => doc.data());
      dispatch({ type: 'SET_TEMPLATES', payload: templatesData });

      const lecture = templatesData.find((item) => item.type === 'lecture');
      dispatch({
        type: 'UPDATE_STUDY_GROUP_PROCESS',
        payload: [lecture],
      });
    });
  }, []);

  const handleAddProcess = () => {
    console.log('add');
    const lecture = state.templates.find((item) => item.type === 'lecture');
    const newProcess = [...state.studyGroup.process, lecture];
    dispatch({
      type: 'UPDATE_STUDY_GROUP_PROCESS',
      payload: newProcess,
    });
  };

  const handleProcessTypeChange = (e, index) => {
    const { value } = e.target;
    const updatedProcess = [...state.studyGroup.process];
    updatedProcess.splice(index, 1);
    const newTemplate = state.templates.find(
      (template) => template.type === value
    );
    updatedProcess.splice(index, 0, { ...newTemplate });
    dispatch({
      type: 'UPDATE_STUDY_GROUP_PROCESS',
      payload: updatedProcess,
    });
  };
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
  console.log(state.templates);
  console.log(state.studyGroup.process);
  return (
    <Container>
      <SideMenu isOpen={true} />
      <Content isOpen={true}>
        <h2>書名：{state.studyGroup.name}</h2>
        <p>
          作者：{state.studyGroup.author}
          <span>舉辦時間：{state.studyGroup.hold}</span>
        </p>
        <div>
          {state.studyGroup.process !== undefined &&
            state.studyGroup.process.map((item, processIndex) => {
              console.log(item);
              return (
                <ProcessCard key={processIndex}>
                  <p>{item.type}</p>
                  <hr />
                  <p>{item.description}</p>
                  <select
                    name="templateType"
                    value={item.type}
                    onChange={(e) => handleProcessTypeChange(e, processIndex)}>
                    <option value="lecture">導讀講稿</option>
                    <option value="extension">衍伸分享</option>
                    <option value="stickyNote">便利貼分享</option>
                    <option value="QA">QA問答</option>
                    <option value="vote">問題票選</option>
                  </select>
                  <input
                    type="button"
                    value="新增流程"
                    onClick={handleAddProcess}
                  />
                  {renderCardContent(item)}
                </ProcessCard>
              );
            })}
        </div>
      </Content>
    </Container>
  );
}
export default Process;
