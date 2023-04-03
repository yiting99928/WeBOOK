import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD3XyLnJTIrQyiK4_5Na-ReoyewPxTbUv4',
  authDomain: 'webook-online-study-group.firebaseapp.com',
  projectId: 'webook-online-study-group',
  storageBucket: 'webook-online-study-group.appspot.com',
  messagingSenderId: '671095613820',
  appId: '1:671095613820:web:3f792fdcc8fe26c43c5cf9',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

const CreateFrom = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 400px;
`;

function CreateStudyGroup() {
  const [createForm, setCreateForm] = useState({
    createBy: 'Yumy',
    name: '',
    image: '',
    author: '',
    chapter: '',
    totalNum: 2,
    hold: '',
    category: '',
    post: '',
    status: 'preparing',
  });

  const handleInputChange = (e) => {
    if (e.target.name === 'image') {
      setCreateForm((prevContact) => ({
        ...prevContact,
        image: e.target.files[0],
      }));
    } else {
      setCreateForm((prevContact) => ({
        ...prevContact,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSubmit = () => {
    for (let key in createForm) {
      if (!createForm[key]) {
        alert('請填寫完整');
        return;
      }
    }
    console.log('handleSubmit');
    formPost();
  };
  
  const formPost = async () => {
    try {
      console.log('formPost');
      const storageRef = ref(storage, `image/${createForm.image.name}`);
      await uploadBytes(storageRef, createForm.image);
      const imageURL = await getDownloadURL(storageRef);
      //   const studyGroupCollection = collection(db, 'studyGroups');
      const docRef = await addDoc(collection(db, 'studyGroups'), {
        createBy: 'Yumy',
        name: createForm.name,
        image: imageURL,
        author: createForm.author,
        chapter: createForm.chapter,
        totalNum: createForm.totalNum,
        hold: createForm.hold,
        category: createForm.category,
        post: createForm.post,
        status: 'preparing',
        createTime: Date.now(),
      });
      console.log(`Doc: ${docRef.id}`);
    } catch (error) {
      console.error('Error: ', error);
    }
  };
  console.log(createForm);

  return (
    <>
      <CreateFrom>
        <div>
          <label>書籍名稱</label>
          <input
            type="text"
            name="name"
            value={createForm.name}
            onChange={handleInputChange}
          />
        </div>
        <input
          type="file"
          accept="image/png, image/jpeg"
          name="image"
          onChange={handleInputChange}
        />
        <div>
          <label>作者</label>
          <input
            type="text"
            name="author"
            value={createForm.author}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>章節</label>
          <input
            type="text"
            name="chapter"
            value={createForm.chapter}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>人數上限</label>
          <span>-</span>
          <input
            type="text"
            name="totalNum"
            value={createForm.totalNum}
            onChange={handleInputChange}
          />
          <span>+</span>
        </div>
        <div>
          <label>舉辦時間</label>
          <input
            type="date"
            name="hold"
            value={createForm.hold}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>類別</label>
          <select
            name="category"
            value={createForm.category}
            onChange={handleInputChange}>
            <option>請選擇書籍類別</option>
            <option>文學小說</option>
            <option>商業理財</option>
            <option>藝術設計</option>
            <option>醫療保健</option>
            <option>言情小說</option>
            <option>社會科學</option>
            <option>言情小說</option>
            <option>生活風格</option>
            <option>勵志成長</option>
            <option>宗教</option>
          </select>
        </div>
        <div>
          <p>讀書會公告</p>
          <textarea
            name="post"
            value={createForm.post}
            onChange={handleInputChange}
          />
        </div>
        <input type="button" value="Submit" onClick={handleSubmit} />
      </CreateFrom>
    </>
  );
}
export default CreateStudyGroup;
