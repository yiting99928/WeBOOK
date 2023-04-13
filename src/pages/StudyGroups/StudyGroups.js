import styled from 'styled-components/macro';
const cardsData = [
  { title: 'Card 1', content: 'This is the first card.' },
  { title: 'Card 2', content: 'This is the second card.' },
  // ... 更多卡片數據
];
function StudyGroups() {
  return (
    <Container>
      {cardsData.map((card, index) => (
        <Card key={index}>
          <h3>{card.title}</h3>
          <p>{card.content}</p>
        </Card>
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  padding: 16px;
`;

const Card = styled.div`
  width: 200px;
  height: 400px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
  }
`;
export default StudyGroups;
