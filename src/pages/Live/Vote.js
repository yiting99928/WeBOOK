import styled from 'styled-components';

function Vote({ item }) {
  return (
    <div>
      {item.data.map((voteItem, index) => (
        <VoteItem key={index}>
          <input type="radio" name="option" />
          <div dangerouslySetInnerHTML={{ __html: voteItem.option }}></div>
        </VoteItem>
      ))}
    </div>
  );
}
const VoteItem = styled.div`
  display: flex;
  gap: 5px;
`;
export default Vote;
