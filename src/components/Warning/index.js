import React from 'react'
import 'feather-icons'
import styled from 'styled-components/macro'
import { Text } from 'rebass'
import { AlertTriangle } from 'react-feather'
import { RowBetween, RowFixed } from '../Row'
import { ButtonDark } from '../ButtonStyled'
import { AutoColumn } from '../Column'
import { Hover } from '..'
import Link from '../Link'
import { useMedia } from 'react-use'
import {useNetworkData} from "../../hooks";

const WarningWrapper = styled.div`
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.red2};
  background: rgba(248, 45, 58, 0.05);
  padding: 1rem;
  color: ${({ theme }) => theme.red2};
  width: 80% !important;
  max-width: 1000px;
  display: ${({ show }) => !show && 'none'};
  margin-bottom: 40px;
  position: relative;
`

const StyledWarningIcon = styled(AlertTriangle)`
  min-height: 20px;
  min-width: 20px;
  stroke: ${({ theme }) => theme.red1};
`

export default function Warning({ type, show, setShow, address }) {
  const {scanUrl, scanName, name2, tokenTextName} = useNetworkData();

  const below800 = useMedia('(max-width: 800px)')

  const textContent = below800 ? (
    <div>
      <Text fontWeight={500} lineHeight={'145.23%'} mt={'10px'}>
        Anyone can create and name any {tokenTextName} token on {name2}, including creating fake versions of existing tokens and
        tokens that claim to represent projects that do not have a token.
      </Text>
      <Text fontWeight={500} lineHeight={'145.23%'} mt={'10px'}>
        Similar to Etherscan, this site automatically tracks analytics for all {tokenTextName} tokens independent of token
        integrity. Please do your own research before interacting with any {tokenTextName} token.
      </Text>
    </div>
  ) : (
    <Text fontWeight={500} lineHeight={'145.23%'} mt={'10px'}>
      Anyone can create and name any {tokenTextName} token on {name2}, including creating fake versions of existing tokens and
      tokens that claim to represent projects that do not have a token. Similar to Etherscan, this site automatically
      tracks analytics for all {tokenTextName} tokens independent of token integrity. Please do your own research before
      interacting with any {tokenTextName} token.
    </Text>
  )

  return (
    <WarningWrapper show={show}>
      <AutoColumn gap="4px">
        <RowFixed>
          <StyledWarningIcon />
          <Text fontWeight={600} lineHeight={'145.23%'} ml={'10px'}>
            Token Safety Alert
          </Text>
        </RowFixed>
        {textContent}
        {below800 ? (
          <div>
            <Hover style={{ marginTop: '10px' }}>
              <Link
                fontWeight={500}
                lineHeight={'145.23%'}
                color={'#7A2DF4'}
                href={`https://${scanUrl}/address/` + address}
                target="_blank"
              >
                View {type === 'token' ? 'token' : 'pair'} contract on {scanName}
              </Link>
            </Hover>
            <RowBetween style={{ marginTop: '20px' }}>
              <div />
              <ButtonDark color={'#E85E59'} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
                I understand
              </ButtonDark>
            </RowBetween>
          </div>
        ) : (
          <RowBetween style={{ marginTop: '10px' }}>
            <Hover>
              <Link
                fontWeight={500}
                lineHeight={'145.23%'}
                color={'#7A2DF4'}
                href={`https://${scanUrl}/address/` + address}
                target="_blank"
              >
                View {type === 'token' ? 'token' : 'pair'} contract on {scanName}
              </Link>
            </Hover>
            <ButtonDark color={'#E85E59'} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
              I understand
            </ButtonDark>
          </RowBetween>
        )}
      </AutoColumn>
    </WarningWrapper>
  )
}
