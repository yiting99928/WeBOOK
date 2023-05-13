import { produce } from 'immer';
import { useReducer } from 'react';

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

export default function useProcessReducer(initialState) {
  return useReducer(reducer, initialState);
}
