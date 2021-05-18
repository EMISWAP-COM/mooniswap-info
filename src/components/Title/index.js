import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Flex, Text } from 'rebass'
import Link from '../Link'
import Logo from '../../assets/logo.svg'
import { useMedia } from 'react-use'

const TitleWrapper = styled.div`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }

  z-index: 10;
`

const LogoWrapper = styled.div`
  margin-right: 10px;
`

const UniIcon = styled(Link)`
  display: block;
  width: 174px;
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const LogoImg = styled.img`
  width: 100%;;
`

export default function Title({ account }) {
  const history = useHistory()

  const below1080 = useMedia('(max-width: 1080px)')

  function getName() {
    if (below1080) {
      return ''
    }

    if (account) {
      return (
        <div>
          <span style={{ fontWeight: 400, verticalAlign: '-webkit-baseline-middle' }}> → Account → Overview </span>
        </div>
      )
    }

    // if (symbol0 && symbol1) {
    //   return (
    //     <div>
    //       <span style={{ fontWeight: 400, verticalAlign: '-webkit-baseline-middle' }}>
    //         {' '}
    //         / {symbol0 + '-' + symbol1}
    //       </span>
    //     </div>
    //   )
    // }
    // if (name && symbol) {
    //   return (
    //     <div>
    //       <span style={{ fontWeight: 400, verticalAlign: '-webkit-baseline-middle' }}>
    //         / {!below1080 ? name : ''} {'(' + symbol + ')'}
    //       </span>
    //     </div>
    //   )
    // }
    return ''
  }

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center">
        <LogoWrapper>
          <UniIcon id="link" onClick={() => history.push('/')}>
            <LogoImg src={Logo} alt="logo" />
          </UniIcon>
        </LogoWrapper>
        <Text fontWeight={600} mx="4px" lineHeight="1.5rem">
          {getName()}
        </Text>
      </Flex>
    </TitleWrapper>
  )
}
