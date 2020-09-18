import React from 'react'
import { Button as RebassButton } from 'rebass/styled-components'
import styled from 'styled-components'
import { Plus, ChevronDown } from 'react-feather'
import { darken, transparentize } from 'polished'
import { RowBetween } from '../Row'

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  outline: none;
`

const BaseCustom = styled(RebassButton)`
  padding: 16px 12px;
  font-size: 1rem;
  font-weight: 400;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
`

const Dull = styled(Base)`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: black;
  height: 100%;
  font-weight: 400;
  &:hover,
  :focus {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
  &:focus {
    box-shadow: 0 0 0 1pt rgba(255, 255, 255, 0.25);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
`

export default function ButtonStyled({ children, ...rest }) {
  return <Base {...rest}>{children}</Base>
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const ButtonLight = styled(Base)`
  background-color: ${({ color }) => (color ? transparentize(0.9, color) : transparentize(0.85, '#9ECFC3'))};
  color: ${({ color }) => (color ? darken(0.1, color) : '#648280')};

  min-width: fit-content;
  border-radius: 12px;
  white-space: nowrap;

  a {
    color: ${({ color }) => (color ? darken(0.1, color) : '#648280')};
  }

  :hover {
    background-color: ${({ color }) => (color ? transparentize(0.8, color) : transparentize(0.8, '#9ECFC3'))};
  }
`

export function ButtonDropdown({ disabled = false, children, ...rest }) {
  return (
    <Base {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} fill="black" />
      </RowBetween>
    </Base>
  )
}

export const ButtonDark = styled(Base)`
  background-color: ${({ color, theme }) => (color ? color : theme.primary1)};
  color: #141717;
  width: fit-content;
  border-radius: 12px;
  white-space: nowrap;

  :hover {
    background-color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.primary1))};
  }
`

export const ButtonFaded = styled(Base)`
  background-color: rgba(0, 0, 0, 0.02);
  color: (255, 255, 255, 0.5);
  white-space: nowrap;

  :hover {
    opacity: 0.5;
  }
`

export function ButtonPlusDull({ disabled, children, ...rest }) {
  return (
    <Dull {...rest}>
      <ContentWrapper>
        <Plus size={16} />
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
      </ContentWrapper>
    </Dull>
  )
}

export function ButtonCustom({ children, bgColor, color, ...rest }) {
  return (
    <BaseCustom bg={bgColor} color={color} {...rest}>
      {children}
    </BaseCustom>
  )
}

export const OptionButton = styled.div`
  width: fit-content;
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: ${({ active, isButtonGroup }) =>
    !isButtonGroup ? 'transparent !important' : active ? '#54B489' : 'rgba(166, 173, 192, 0.15)'};
  color: ${({ active }) => (active ? 'white' : '#24272C')};
  transition: all 0.3s ease;
  margin-right: 0.5rem !important;

  &:last-child {
    margin-right: 0 !important;
  }

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
    color: ${({ isButtonGroup }) => isButtonGroup && 'white'};
    background-color: ${({ disabled }) => !disabled && '#54B489'};
  }
`
