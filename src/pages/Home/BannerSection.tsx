import styled, { keyframes } from 'styled-components/macro';
import BannerImg from './BannerImg';
function BannerSection() {
  return (
    <Banner>
      <BannerInfo>
        <Title $delay={0}>走進書適圈</Title>
        <Title $delay={0.5}>找到你的閱讀舒適圈</Title>
        <SubTitle $delay={1}>Cozy up with books!</SubTitle>
      </BannerInfo>
      <BannerImg />
    </Banner>
  );
}

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const SubTitle = styled.div<{ $delay: number }>`
  margin-top: 16px;
  font-size: 24px;
  color: #e95f5c;
  animation: ${fadeIn} 2s cubic-bezier(0.5, 0, 0.1, 1) both;
  animation-delay: ${({ $delay }) => $delay}s;
`;
const Title = styled.div<{ $delay: number }>`
  font-weight: 600;
  color: #e95f5c;
  font-size: 42px;
  letter-spacing: 1.5;
  line-height: 1.5;
  animation: ${fadeIn} 2s cubic-bezier(0.5, 0, 0.1, 1) both;
  animation-delay: ${({ $delay }) => $delay}s;
    @media screen and (max-width: 640px) {
    font-size: 30px;
  }
`;
const Banner = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  justify-content: space-between;
  padding: 0px 20px;
`;
const BannerInfo = styled.div`
  padding-left: 20px;
  z-index: 1;
  align-items: center;
  min-width: 420px;
  @media screen and (max-width: 768px) {
    min-width: 100%;
    text-align: center;
    width: 100%;
    padding: 0px;
  }
`;
export default BannerSection;
