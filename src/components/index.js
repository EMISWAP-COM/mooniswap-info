import React from 'react'
import styled from 'styled-components/macro'
import { Text, Box } from 'rebass'

import Link from './Link'
import {useUrls} from "../hooks";

const Divider = styled(Box)`
  height: 1px;
  background-color: ${({ theme }) => theme.border2};
`

const Hint = ({ children, ...rest }) => (
  <Text fontSize={16} weight={500} {...rest}>
    {children}
  </Text>
)

const Address = ({ address, token, ...rest }) => {
  const urls = useUrls();

  return (
    <Link
      color="button"
      href={token ? urls.showToken(address) : urls.showAddress(address)}
      external
      style={{wordBreak: 'break-all'}}
      {...rest}
    >
      {address}
    </Link>
  )
}

export const Hover = styled.div`
  :hover {
    cursor: pointer;
    opacity: ${({ fade }) => fade && '0.7'};
  }
`

const EmptyCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-radius: 20px;
  height: ${({ height }) => height && height};
`

export { Hint, Divider, Address, EmptyCard }
