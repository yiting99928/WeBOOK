import { Draft, produce } from 'immer';
import { useReducer } from 'react';
import { PayloadType, TemplateType } from '../types/types';

function reducer(
  processData: TemplateType[],
  { type, payload = {} }: { type: string; payload: PayloadType }
) {
  const {
    lecture,
    processIndex,
    templates,
    e,
    data,
    process,
    fromIndex,
    toIndex,
  } = payload;

  return produce(processData, (draft: Draft<TemplateType[]>) => {
    switch (type) {
      case 'INIT_CARD': {
        if (!lecture) return;
        draft.push(lecture);
        break;
      }
      case 'SET_CARD': {
        return process;
      }
      case 'ADD_CARD': {
        if (!lecture || !processIndex) return;
        draft.splice(processIndex + 1, 0, lecture);
        break;
      }
      case 'CHANGE_CARD': {
        if (!templates || processIndex === undefined) return;
        const newTemplate = templates.find(
          (template: TemplateType) => template.type === e!.target.value
        );
        if (!newTemplate) return;
        draft[processIndex] = newTemplate;
        break;
      }
      case 'COPY_CARD': {
        if (!processIndex) return;
        const updatedCard = draft[processIndex];
        draft.splice(processIndex + 1, 0, updatedCard);
        break;
      }
      case 'DEL_CARD': {
        if (!processIndex) return;
        draft.splice(processIndex, 1);
        break;
      }
      case 'MOVE_CARD': {
        if (!fromIndex || !toIndex) return;
        const itemToMove = draft[fromIndex];
        draft.splice(fromIndex, 1);
        draft.splice(toIndex, 0, itemToMove);
        break;
      }
      case 'UPDATE_DESCRIPTION': {
        if (!processIndex) return;
        draft[processIndex].description = data;
        break;
      }
      case 'UPDATE_DATA': {
        if (!processIndex) return;
        draft[processIndex].data = data;
        break;
      }
      default:
        throw new Error(`Unknown action: ${type}`);
    }
  });
}

export default function useProcessReducer(initialState: TemplateType[]) {
  return useReducer(reducer, initialState);
}
