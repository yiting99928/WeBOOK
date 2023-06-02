import { FieldValue, Timestamp } from 'firebase/firestore';
import { ChangeEvent } from 'react';

type UserType = {
  userImg?: string;
  email?: string;
  name?: string;
  password?: string;
};

type MessageType = {
  message: string;
  timestamp: Date;
  sender?: string | null;
  senderName?: string | null;
  senderImg?: string | null;
};

type CategoryType =
  | '全部讀書會'
  | '文學小說'
  | '商業理財'
  | '藝術設計'
  | '醫療保健'
  | '言情小說'
  | '社會科學'
  | '生活風格'
  | '勵志成長'
  | '自然科普'
  | '旅遊觀光'
  | '宗教'
  | '漫畫'
  | '科技';

type QAItem = {
  answer: boolean;
  option: string;
};

type LectureItem = string;

type StickyNoteItem = {
  name: string;
  email: string;
  message: string;
};

type VoteItem = {
  number: number;
  option: string;
};

type TemplateType =
  | {
      type: 'QA';
      data: QAItem[];
      description: string;
    }
  | {
      type: 'lecture';
      data: LectureItem;
      description: string;
    }
  | {
      type: 'stickyNote';
      data: StickyNoteItem[];
      description: string;
    }
  | {
      type: 'vote';
      data: VoteItem[];
      description: string;
    };

type StatusType = 'ongoing' | 'preparing' | 'finished' | 'upcoming';

type StatusTextType = {
  [P in StatusType]: {
    type: string;
    color: string;
  };
};

type SdpType = RTCSessionDescriptionInit;

type UpdateDataType =
  | {
      process: TemplateType[];
    }
  | { status: StatusType }
  | { offer: RTCSessionDescriptionInit }
  | { answer: RTCSessionDescriptionInit }
  | { currentCard: number }
  | { viewers: FieldValue }
  | { userImg: string };

type StudyGroupType = {
  id: string;
  chapter: string;
  createBy: string;
  author: string;
  image: string | File;
  host: string;
  groupName: string;
  name: string;
  status: StatusType;
  createTime: Timestamp;
  post: string;
  startTime: Timestamp;
  category: string;
  endTime: Timestamp;
  process?: TemplateType[];
  note?: string;
};

type PayloadType = {
  lecture?: TemplateType;
  processIndex?: number;
  templates?: TemplateType[];
  e?: ChangeEvent<HTMLSelectElement>;
  data?: any;
  process?: TemplateType[];
  fromIndex?: number;
  toIndex?: number;
};

export type {
  UserType,
  CategoryType,
  StudyGroupType,
  UpdateDataType,
  TemplateType,
  SdpType,
  StatusTextType,
  MessageType,
  QAItem,
  PayloadType,
  StickyNoteItem,
  VoteItem,
  LectureItem,
};
