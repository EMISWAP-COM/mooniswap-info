import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {useNetworkData} from "../../hooks";
import NetworkSwitchModal from "./NetworkSwitchModal";

const NetworkWrapper = styled.div`
  white-space: nowrap;
  width: fit-content;
  margin-left: 10px;
  pointer-events: auto;
  
  @media (max-width: 600px) {
    position: fixed;
    right: 20px;
  }
`;

const NetworkButtonSwitch = styled.button`  
  box-sizing: border-box;
  width: fit-content;
  min-width: 120px;
  height: 40px;
  margin-left: 24px;
  padding: 0 16px;
  border: 1px solid #615C69;
  border-radius: 4px;
  background: rgb(57, 57, 70);
  color: white;
  
  font-weight: 500;
  text-align: center;
  outline: none;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  
  &:focus, &:hover {
    border: 1px solid rgb(122, 45, 244);
    background: rgb(57, 57, 70);
    box-shadow: none;
  }
  
  &:active {
    border: 1px solid rgb(97, 92, 105);
    background: rgb(57, 57, 70);
    box-shadow: none;
  }

  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`;

const NetworkIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 50%;
  background: white;
`;

const NetworkLabel = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   height: 18px;
   margin-left: 16px;
   padding: 0 8px;
   border-radius: 50px;
   font-size: 8px;
   background: #E478FF;
   color: ${({theme}) => theme.dark2};
`;

export default function NetworkSwitch() {
  const {icon, name} = useNetworkData();

  const [isVisibleModal, setVisibleModal] = useState(null);

  const onClickSwitchButton = () => {
    setVisibleModal(true);
  }

  const onCloseModal = () => {
    setVisibleModal(false);
  }

  return (
    <NetworkWrapper>
      <NetworkButtonSwitch
        onClick={onClickSwitchButton}
      >
        <NetworkIcon>
          <img
            style={{maxHeight: '18px', maxWidth: '18px'}}
            src={icon}
            alt={name}
          />
        </NetworkIcon>
        <span>{name || 'Change Network'}</span>
      </NetworkButtonSwitch>
      {isVisibleModal && (
        <NetworkSwitchModal onClose={onCloseModal}/>
      )}
    </NetworkWrapper>
  )
}
