import React, { useState } from 'react';
import styled from 'styled-components/macro';

const Sidebar = styled.div`
  width: ${(props) => (props.isOpen ? '200px' : '50px')};
  background-color: #333;
  color: #fff;
  transition: all 0.3s ease;
`;
const ToggleButton = styled.button`
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px;
  margin: 20px;
  cursor: pointer;
`;

function SideMenu(){
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
      };

    return <Sidebar isOpen={isOpen}>
    <ToggleButton onClick={toggleSidebar}>
      {isOpen ? '收合' : '展開'}
    </ToggleButton>
    <ul>
      <li>會員名稱:Yumy</li>
      <li>舉辦讀書會:5場</li>
      <li>參加讀書會:2場</li>
    </ul>
    <ul>
      <li>進行中</li>
      <li>準備中</li>
      <li>已結束</li>
    </ul>
  </Sidebar>
}
export default SideMenu;