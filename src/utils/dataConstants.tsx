import { CategoryType, StatusTextType } from '../types/types';

export const categoryOptions: CategoryType[] = [
  '全部讀書會',
  '文學小說',
  '商業理財',
  '藝術設計',
  '醫療保健',
  '言情小說',
  '社會科學',
  '生活風格',
  '勵志成長',
  '自然科普',
  '旅遊觀光',
  '宗教',
  '漫畫',
  '科技',
];

export const statusText: StatusTextType = {
  ongoing: { type: '進行中', color: '#DF524D' },
  preparing: { type: '準備中', color: '#F89D7D' },
  finished: { type: '已結束', color: '#FAC6B8' },
  upcoming: { type: '即將舉辦', color: '#DF524D' },
};

export const imgUrl = [
  'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg1.jpg?alt=media&token=869610eb-fe80-46ff-af95-80466259352a',
  'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg3.jpg?alt=media&token=3a0d39d1-b449-43b6-9426-06c193a18082',
  'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg2.jpg?alt=media&token=e90f2681-4fa8-479f-9e2c-dab3a787a192',
  'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg4.jpg?alt=media&token=37d32861-c9d0-4046-a2ba-daa9d06acc9f',
  'https://firebasestorage.googleapis.com/v0/b/webook-studygroups.appspot.com/o/userImg%2FuserImg5.jpg?alt=media&token=430ce74b-8e60-462e-ad8b-c7d2b01fa471',
];