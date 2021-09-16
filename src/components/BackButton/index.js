import React from 'react'
import styled from 'styled-components/macro'
import backSvg from '../../assets/back.svg'

export const CircleButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
  width: 48px;
  margin: 0 24px 20px 0;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.btn1};
  cursor: pointer;
  
  :hover, :focus {
    background-color: ${({ theme }) => theme.focus};
  }
`

export function BackButton({onClick}) {
  return (
    <CircleButton onClick={onClick}>
      <img src={backSvg} alt=""/>
    </CircleButton>
  )
}
