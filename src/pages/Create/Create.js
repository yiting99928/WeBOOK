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
import DecoBg from '../../components/DecoBg';
import { BiImageAdd } from 'react-icons/bi';
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
  const [previewUrl, setPreviewUrl] = useState('');

  const handleInputChange = (e) => {
    if (e.target.name === 'image') {
      setCreateForm((prevContact) => ({
        ...prevContact,
        image: e.target.files[0],
      }));

      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(e.target.files[0]);
    } else {
      setCreateForm((prevContact) => ({
        ...prevContact,
        [e.target.name]: e.target.value,
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
        hold: createForm.hold,
        category: createForm.category,
        post: createForm.post,
        createTime: serverTimestamp(),
      });
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
      hold: '',
      category: '',
      post: '',
      createBy: user.email,
      host: user.name,
      status: 'preparing',
    });
  };
  // console.log(createForm);
  return (
    <Wrapper>
      <DecoBg />
      <FormContainer>
        <FormTitle>創建讀書會</FormTitle>
        <Form>
          <InputContainer>
            <FormInputs>
              <div>書籍名稱</div>
              <TextInput
                type="text"
                name="name"
                value={createForm.name}
                onChange={handleInputChange}
              />
            </FormInputs>
            <FormInputs>
              <label>作者</label>
              <TextInput
                type="text"
                name="author"
                value={createForm.author}
                onChange={handleInputChange}
              />
            </FormInputs>
            <FormInputs>
              <div>章節</div>
              <TextInput
                type="text"
                name="chapter"
                value={createForm.chapter}
                onChange={handleInputChange}
              />
            </FormInputs>
            <FormInputs>
              <div>舉辦時間</div>
              <SelectInput
                type="datetime-local"
                name="hold"
                value={createForm.hold}
                onChange={handleInputChange}
              />
            </FormInputs>
            <FormInputs>
              <div>類別</div>
              <CategoryInput
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
                <option>生活風格</option>
                <option>勵志成長</option>
                <option>旅遊觀光</option>
                <option>自然科普</option>
                <option>宗教</option>
                <option>漫畫</option>
                <option>科技</option>
              </CategoryInput>
            </FormInputs>
            <FormInputs>
              <p>讀書會公告</p>
              <Post
                name="post"
                value={createForm.post}
                onChange={handleInputChange}
              />
            </FormInputs>
          </InputContainer>
          <ImgContainer previewUrl={previewUrl}>
            <BiImageAdd previewUrl={previewUrl} />
            <ImgInput
              type="file"
              accept="image/png, image/jpeg"
              name="image"
              onChange={handleInputChange}
            />
          </ImgContainer>
        </Form>
        <SubmitInput type="button" value="創建讀書會" onClick={handleSubmit} />
      </FormContainer>
    </Wrapper>
  );
}
const Wrapper = styled.div``;
const FormContainer = styled.form`
  margin: 0 auto;
  max-width: 1125px;
  padding: 40px 60px;
  margin-bottom: 150px;
  margin-top: 100px;
  background: #fff;
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;
const FormTitle = styled.div`
  color: #5b5b5b;
  font-weight: 600;
  font-size: 32px;
  text-align: center;
  margin-bottom: 50px;
  letter-spacing: 2;
`;
const Form = styled.div`
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 45px;
`;
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  color: #5b5b5b;
`;
const FormInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const ImgContainer = styled.div`
  height: 350px;
  width: 250px;
  border-radius: 6px;
  background-color: #f9f9f9;
  position: relative;
  background-image: ${({ previewUrl }) => `url(${previewUrl})`};
  background-size: cover;

  svg {
    display:${({ previewUrl }) => (previewUrl ? 'none' : 'block')};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(5);
    color: #ececec;
  }
`;
const ImgInput = styled.input`
  height: 350px;
  opacity: 0;
`;
const TextInput = styled.input`
  width: 100%;
  height: 32px;
  border: 1px solid #909090;
  padding: 8px 12px;
`;
const SelectInput = styled.input`
  width: 200px;
  height: 32px;
  border: 1px solid #909090;
  padding: 0 8px;
`;
const CategoryInput = styled.select`
  padding: 0 8px;
  width: 200px;
  height: 32px;
  border: 1px solid #909090;
  border-radius: 4px;
`;
const Post = styled.textarea`
  border: 1px solid #909090;
  border-radius: 4px;
  width: 100%;
  height: 200px;
`;
const SubmitInput = styled.input`
  width: 100%;
  margin-top: 20px;
  background: #ffac4c;
  border-radius: 4px;
  padding: 6px 12px;
  color: #fff;
  letter-spacing: 1;
  border: 0;
  height: 44px;
  font-size: 18px;
`;
export default Create;
