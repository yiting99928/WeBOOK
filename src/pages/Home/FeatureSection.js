import { AiOutlineEdit, AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsBook, BsChatLeftDots, BsSticky } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { RiLiveLine } from 'react-icons/ri';
import { VscSave } from 'react-icons/vsc';
import styled from 'styled-components/macro';
import edit from './featureVideo/edit.mp4';
import live from './featureVideo/live.mp4';
import note from './featureVideo/note.mp4';

function FeatureSection() {

  const featuresData = [
    {
      videoSrc: edit,
      title: '協助導讀的流程',
      description: '協助導讀者規劃有趣的讀書流程，讓導讀更輕鬆。',
      points: [
        { icon: AiOutlineEdit, text: '編輯導讀流程' },
        { icon: RiLiveLine, text: '線上直播導讀' },
      ],
      reversed: false,
    },
    {
      videoSrc: live,
      title: '有趣的讀書會互動',
      description: '互動元素，導讀過程變得生動有趣。',
      points: [
        { icon: BsBook, text: '導讀講稿分享' },
        { icon: AiOutlineQuestionCircle, text: 'QA問答' },
        { icon: MdHowToVote, text: '問題票選' },
        { icon: BsSticky, text: '便利貼分享' },
      ],
      reversed: true,
    },
    {
      videoSrc: note,
      title: '讀書會的文字紀錄',
      description:
        '導讀過程聊天室互動、紀錄筆記功能，讓你能夠與他人討論，也紀錄精彩的讀書會過程留存。',
      points: [
        { icon: BsChatLeftDots, text: '與其他參與者聊天室互動' },
        { icon: VscSave, text: '留存讀書會筆記' },
      ],
      reversed: false,
    },
  ];

  return (
    <Features>
      {featuresData.map((feature) => (
        <FeatureWrap key={feature.title}>
          <FeatureImg reversed={feature.reversed}>
            <FeatureDeco />
            <Video
              loop
              playsInline
              autoPlay
              muted
              src={feature.videoSrc}
              type="video/mp4"
              controls={false}
            />
          </FeatureImg>
          <Feature reversed={feature.reversed}>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
            <FeaturePoints>
              {feature.points.map((point) => (
                <FeaturePoint key={point.text}>
                  <point.icon />
                  <p>{point.text}</p>
                </FeaturePoint>
              ))}
            </FeaturePoints>
          </Feature>
        </FeatureWrap>
      ))}
    </Features>
  );
}

const Video = styled.video`
  width: 100%;
  border-radius: 6px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid white;
`;

const Features = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  letter-spacing: 0.05em;
  display: flex;
  flex-direction: column;
  margin-bottom: 180px;
  height: 1300px;
  justify-content: space-between;
`;
const FeatureWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  gap: 60px;
`;
const Feature = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 480px;
  order: ${({ reversed }) => (reversed ? 0 : 1)};
`;
const FeatureDeco = styled.div`
  width: 450px;
  height: 400px;
  background-color: rgba(239, 140, 138, 0.1);
  position: absolute;
  z-index: -1;
  filter: blur(60px);
`;
const FeatureImg = styled.div`
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  order: ${({ reversed }) => (reversed ? 1 : 0)};
  :hover ${FeatureDeco} {
    background-color: rgba(239, 140, 138, 0.3);
  }
`;
const FeatureTitle = styled.div`
  color: #df524d;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 1.5;
`;
const FeatureDescription = styled.div`
  line-height: 1.5;
  color: #5b5b5b;
  font-size: 20px;
`;
const FeaturePoints = styled.div`
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const FeaturePoint = styled.div`
  font-size: 20px;
  color: #5b5b5b;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export default FeatureSection;
