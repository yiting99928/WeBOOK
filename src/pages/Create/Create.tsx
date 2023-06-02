import dayjs from 'dayjs';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { ChangeEvent, useContext, useState } from 'react';
import { BiImageAdd } from 'react-icons/bi';
import styled from 'styled-components/macro';
import { MainBtn } from '../../components/Buttons';
import DecoBg from '../../components/DecoBg';
import { AuthContext } from '../../context/authContext';
import { StudyGroupType } from '../../types/types';
import { categoryOptions } from '../../utils/dataConstants';
import data from '../../utils/firebase';
import { uploadFile } from '../../utils/firebaseStorage';
import modal from '../../utils/modal';

type PartialStudyGroupType = Partial<StudyGroupType>;

function Create() {
  const { user } = useContext(AuthContext);
  const [createForm, setCreateForm] = useState<PartialStudyGroupType>({
    groupName: '',
    name: '',
    image: '',
    author: '',
    chapter: '',
    createBy: user?.email,
    host: user?.name,
    startTime: undefined,
    endTime: undefined,
    status: 'preparing',
    category: '',
    post: '',
  });

  const [previewurl, setPreviewUrl] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'image') {
      setCreateForm((prevContact) => ({
        ...prevContact,
        image: e.target.files![0],
      }));

      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          setPreviewUrl(fileReader.result);
        }
      };
      if (e.target.files && e.target.files.length > 0) {
        fileReader.readAsDataURL(e.target.files[0]);
      }
    } else {
      setCreateForm((prevContact) => ({
        ...prevContact,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    for (const key in createForm) {
      if (!createForm[key as keyof Partial<StudyGroupType>]) {
        modal.quit('請填寫完整');
        return;
      }
    }
    if (
      new Date(createForm.endTime!.seconds * 1000) <=
      new Date(createForm.startTime!.seconds * 1000)
    ) {
      modal.quit('結束時間需超過舉辦時間!');
      return;
    }

    formPost();
    resetForm();
  };

  const formPost = async () => {
    try {
      const imagePath = `image/${createForm.groupName! + createForm.name!}`;
      const imageURL = await uploadFile(imagePath, createForm.image as File);

      const TimestampToDate = (timestamp: Timestamp) => {
        return new Date(timestamp.seconds * 1000);
      };

      const startTimestamp = Timestamp.fromDate(
        dayjs(TimestampToDate(createForm.startTime!)).toDate()
      );
      const endTimestamp = Timestamp.fromDate(
        dayjs(TimestampToDate(createForm.endTime!)).toDate()
      );

      const docRef = await data.addGroup({
        ...createForm,
        groupName: createForm.groupName ?? '',
        name: createForm.name ?? '',
        image: imageURL,
        author: createForm.author ?? '',
        chapter: createForm.chapter ?? '',
        startTime: startTimestamp,
        category: createForm.category ?? '',
        post: createForm.post ?? '',
        createTime: serverTimestamp(),
        endTime: endTimestamp,
      });

      await data.setUserGroup(docRef.id, user!.email, { note: '' });
      modal.create('成功建立讀書會!', docRef.id);
    } catch (error) {
      modal.quit('讀書會建立失敗!');
      console.error('Error: ', error);
    }
  };

  const resetForm = () => {
    setCreateForm({
      groupName: '',
      name: '',
      image: '',
      author: '',
      chapter: '',
      startTime: undefined,
      endTime: undefined,
      category: '',
      post: '',
      createBy: user?.email,
      host: user?.name,
      status: 'preparing',
    });
    setPreviewUrl('');
  };

  const isStartTimeInvalid =
    createForm.startTime &&
    dayjs(new Date(createForm.startTime.seconds * 1000)).isBefore(dayjs());

  const isEndTimeInvalid =
    createForm.endTime &&
    (dayjs(new Date(createForm.endTime.seconds * 1000)).isBefore(dayjs()) ||
      dayjs(new Date(createForm.endTime.seconds * 1000)).isBefore(
        dayjs(new Date(createForm.startTime!.seconds * 1000))
      ));

  return (
    <Wrapper>
      <DecoBg />
      <FormContainer>
        <FormTitle>建立讀書會</FormTitle>
        <Form>
          <InputContainer>
            <FormInputs>
              <label>讀書會名稱</label>
              <TextInput
                type="text"
                name="groupName"
                value={createForm.groupName}
                onChange={handleInputChange}
              />
            </FormInputs>
            <FormInputs>
              <label>書籍名稱</label>
              <TextInput
                type="text"
                name="name"
                value={createForm.name}
                onChange={handleInputChange}
              />
            </FormInputs>
            <MobileImgContainer>
              <ImgPrev $previewurl={previewurl}>
                <BiImageAdd />
                <ImgInput
                  type="file"
                  accept="image/png, image/jpeg"
                  name="image"
                  onChange={handleInputChange}
                />
              </ImgPrev>
              <Advice>
                建議圖片使用書籍封面2:3或3:4
                <br /> 檔案須小於 5 MB
              </Advice>
            </MobileImgContainer>
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
              <label>舉辦時間</label>
              <DateInput>
                <SelectInput
                  type="datetime-local"
                  name="startTime"
                  value={createForm.startTime}
                  onChange={handleInputChange}
                />
                {isStartTimeInvalid && (
                  <StartTimeWarn>請選擇未來時間!</StartTimeWarn>
                )}
              </DateInput>
            </FormInputs>
            <FormInputs>
              <label>結束時間</label>
              <DateInput>
                <SelectInput
                  type="datetime-local"
                  name="endTime"
                  value={createForm.endTime}
                  onChange={handleInputChange}
                />
                {isEndTimeInvalid && (
                  <EndTimeWarn>結束時間需超過舉辦時間!</EndTimeWarn>
                )}
              </DateInput>
            </FormInputs>
            <FormInputs>
              <label>類別</label>
              <CategoryInput
                name="category"
                value={createForm.category}
                onChange={handleInputChange}>
                <option>請選擇書籍類別</option>
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </CategoryInput>
            </FormInputs>
            <FormInputs>
              <p>讀書會公告</p>
              <Post
                name="post"
                value={createForm.post}
                onChange={handleInputChange}
                placeholder="請填寫你想告訴參與者的話 例：書籍的建議閱讀順序、導讀的風格、注意事項..."
              />
            </FormInputs>
          </InputContainer>
          <ImgContainer>
            <ImgPrev previewurl={previewurl}>
              <BiImageAdd previewurl={previewurl} />
              <ImgInput
                type="file"
                accept="image/png, image/jpeg"
                name="image"
                onChange={handleInputChange}
              />
            </ImgPrev>
            <Advice>
              建議圖片使用書籍封面2:3或3:4
              <br /> 檔案須小於 5 MB
            </Advice>
          </ImgContainer>
        </Form>
        <MainBtn onClick={handleSubmit} height={'44px'}>
          建立讀書會
        </MainBtn>
      </FormContainer>
    </Wrapper>
  );
}
const ImgContainer = styled.div`
  @media screen and (max-width: 768px) {
    display: none;
  }
`;
const MobileImgContainer = styled.div`
  display: none;
  @media screen and (max-width: 768px) {
    display: block;
  }
`;
const DateInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Warn = styled.div`
  font-size: 14px;
  color: #e95f5c;
`;
const StartTimeWarn = styled(Warn)``;
const EndTimeWarn = styled(Warn)``;
const Advice = styled.div`
  margin-top: 30px;
  background-color: rgb(254, 224, 212);
  padding: 15px 10px;
  border-radius: 6px;
  line-height: 1.5;
  @media screen and (max-width: 768px) {
    width: 280px;
  }
`;
const Wrapper = styled.div`
  margin: 0px 30px;
`;
const FormContainer = styled.form`
  margin: 0 auto;
  max-width: 1125px;
  padding: 40px 60px;
  margin-bottom: 150px;
  margin-top: 100px;
  background: #fff;
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  @media screen and (max-width: 768px) {
    padding: 20px 30px;
  }
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
  margin-bottom: 20px;
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
const ImgPrev = styled.div<{ $previewurl: string }>`
  height: 350px;
  width: 250px;
  border-radius: 6px;
  background-color: #f9f9f9;
  position: relative;
  background-image: ${({ $previewurl }) => `url(${$previewurl})`};
  background-size: cover;
  background-position: center center;
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.05);

  svg {
    display: ${({ $previewurl }) => ($previewurl ? 'none' : 'block')};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(5);
    color: #ececec;
  }
  @media screen and (max-width: 768px) {
    height: 300px;
    width: 200px;
  }
`;
const ImgInput = styled.input`
  height: 350px;
  opacity: 0;
  cursor: pointer;
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
  padding: 0 4px;
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
  padding: 8px;
`;
export default Create;
