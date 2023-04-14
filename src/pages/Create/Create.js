import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { storage, db } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { AuthContext } from '../../context/authContext';

function Create() {
  const { user } = useContext(AuthContext);
  const [createForm, setCreateForm] = useState({
    name: '',
    image: '',
    author: '',
    chapter: '',
    createBy: user.email,
    host: user.name,
    hold: '',
    status: 'preparing',
    category: '',
    post: '',
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
        // [e.target.name]:
        //   e.target.name === 'totalNum'
        //     ? parseInt(e.target.value)
        //     : e.target.value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (let key in createForm) {
      if (!createForm[key]) {
        alert('請填寫完整');
        return;
      }
    }
    formPost();
    resetForm();
  };
  const formPost = async () => {
    try {
      const storageRef = ref(
        storage,
        `image/${createForm.image.name + createForm.name}`
      );
      await uploadBytes(storageRef, createForm.image);
      const imageURL = await getDownloadURL(storageRef);
      const docRef = await addDoc(collection(db, 'studyGroups'), {
        ...createForm,
        name: createForm.name,
        image: imageURL,
        author: createForm.author,
        chapter: createForm.chapter,
        // totalNum: createForm.totalNum,
        hold: createForm.hold,
        category: createForm.category,
        post: createForm.post,
        createTime: serverTimestamp(),
      });
      // 在使用者DATA集合中新增讀書會筆記
      const userStudyGroupsRef = doc(
        db,
        'users',
        user.email,
        'userStudyGroups',
        docRef.id
      );
      await setDoc(userStudyGroupsRef, {
        note: '',
      });
      console.log(`User Study Group Doc: ${docRef.id}`);
      alert('已創建讀書會!');
    } catch (error) {
      console.error('Error: ', error);
    }
  };
  const resetForm = () => {
    setCreateForm({
      name: '',
      image: '',
      author: '',
      chapter: '',
      // totalNum: 2,
      hold: '',
      category: '',
      post: '',
      createBy: user.email,
      host: user.name,
      status: 'preparing',
    });
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
        {/* <div>
          <label>人數上限</label>
          <input
            type="number"
            name="totalNum"
            value={createForm.totalNum}
            onChange={handleInputChange}
          />
        </div> */}
        <div>
          <label>舉辦時間</label>
          <input
            type="datetime-local"
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
          <Post
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
const Post = styled.textarea`
  width: 400px;
  height: 300px;
`;
const CreateFrom = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 400px;
`;
export default Create;
