import React, {useEffect, useMemo, useState} from 'react'
import {withRouter} from 'react-router-dom'
import 'feather-icons'
import styled from 'styled-components/macro'

import {Text} from 'rebass'
import Panel from '../components/Panel'

import {AutoRow, RowBetween, RowFixed} from '../components/Row'
import Column, {AutoColumn} from '../components/Column'
import {ButtonDark, ButtonLight} from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/Loader'
import Question from '../components/Question'

import {formattedNum, formattedPercent, getLiquidityFromToken, getPoolLink, getSwapLink} from '../helpers'
import {useColor, useNetworkData} from '../hooks'
import {usePairData, usePairTransactions} from '../contexts/PairData'
import {ThemedBackground, TYPE} from '../Theme'
import CopyHelper from '../components/Copy'
import {useMedia} from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import {transparentize} from 'polished'
import TokenLogo from '../components/TokenLogo'
import {Hover} from '../components'
import {useEthPrice} from '../contexts/GlobalData'
import Warning from '../components/Warning'
import {usePathDismissed} from '../contexts/LocalStorage'
import {useVerifiedTokens} from '../contexts/TokenData'
import {BackButton} from '../components/BackButton'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 80px);
  padding: 0 40px;
  padding-bottom: 80px;

  @media screen and (max-width: 640px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }

  & > * {
    width: 90%;
    max-width: 1240px;
  }
`

const DashboardWrapper = styled.div`
  width: 100%;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto auto 1fr;
  column-gap: 30px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;
  background-color: ${({color}) => (color ? transparentize(0.9, color) : transparentize(0.85, '#9ECFC3'))};

  :hover {
    cursor: pointer;
    background-color: ${({color}) => (color ? transparentize(0.8, color) : transparentize(0.8, '#9ECFC3'))};
  }
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const WarningGrouping = styled.div`
  opacity: ${({disabled}) => disabled && '0.4'};
  pointer-events: ${({disabled}) => disabled && 'none'};
`

function PairPage({pairAddress, history}) {
  const {scanUrl, scanName} = useNetworkData();

  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange,
    oneDayExtraFee,
    extraFeeChangeUSD
  } = usePairData(pairAddress)

  const verifiedTokens = useVerifiedTokens()

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const transactions = usePairTransactions(pairAddress)
  const backgroundColor = useColor(pairAddress)

  const getLiquidity = () => {
    let liquidity = null;

    if (reserveUSD) {
      // liquidity = reserveUSD;
    } else if (trackedReserveUSD) {
      // liquidity = trackedReserveUSD;
    }

    // console.log(reserveUSD, trackedReserveUSD);

    if ((!liquidity || liquidity === "0") && token0 && token1 && ethPrice) {
      const token0USD = getLiquidityFromToken(token0, reserve0, ethPrice);
      const token1USD = getLiquidityFromToken(token1, reserve1, ethPrice);

      liquidity = token0USD + token1USD;
    }

    return liquidity ? formattedNum(liquidity, true) : '-';
  }

  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true)
  useEffect(() => {
    if (!trackedReserveUSD) {
      setUsingTracked(false)
    }
  }, [trackedReserveUSD])

  // volume
  const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : oneDayVolumeUSD === 0 ? '$0' : '-'
  const volumeChange = formattedPercent(volumeChangeUSD)
  const feePercentChange = formattedPercent(extraFeeChangeUSD)

  // token data for usd
  const [ethPrice] = useEthPrice()

  // rates
  const token0Rate = reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : '-'
  const token1Rate = reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : '-'

  const token0USD = useMemo(() => {
    if (token1?.symbol?.includes('USD')) {
      return token0Rate;
    }
    return token0?.derivedETH && ethPrice ? formattedNum(parseFloat(token0.derivedETH) * parseFloat(ethPrice), true) : ''
  }, [ethPrice, token0, token1, token0Rate]);

  const token1USD = useMemo(() => {
    if (token0?.symbol?.includes('USD')) {
      return token1Rate;
    }
    return token1?.derivedETH && ethPrice ? formattedNum(parseFloat(token1.derivedETH) * parseFloat(ethPrice), true) : ''
  }, [ethPrice, token0, token1, token1Rate]);

  // txn percentage change
  const txnChangeFormatted = formattedPercent(txnChange)

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  return (
    <PageWrapper>
      <ThemedBackground/>
      <Warning
        type={'pair'}
        show={
          !dismissed &&
          verifiedTokens &&
          !(verifiedTokens.includes(token0?.id) && verifiedTokens.includes(token1?.id)) &&
          token1 &&
          token0
        }
        setShow={markAsDismissed}
        address={pairAddress}
      />
      <WarningGrouping
        disabled={
          !dismissed &&
          (!verifiedTokens || !(verifiedTokens.includes(token0?.id) && verifiedTokens.includes(token1?.id)))
        }
      >
        <RowBetween mt={20} style={{flexWrap: 'wrap'}}>
          <RowFixed style={{flexWrap: 'wrap'}}>
            <BackButton onClick={() => history.push(`/`)}/>
            <RowFixed mb={20}>
              {token0 && token1 && (
                <DoubleTokenLogo
                  a0={token0?.id || ''}
                  s0={token0?.symbol || ''}
                  a1={token1?.id || ''}
                  s1={token1?.symbol || ''}
                  size={32}
                  margin={true}
                />
              )}{' '}
              <Text fontSize={'2rem'} fontWeight={600} style={{margin: '0 1rem'}}>
                {token0 && token1 ? (
                  <>
                    <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                    <span>-</span>
                    <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>{token1.symbol}</HoverSpan> Pair
                  </>
                ) : (
                  ''
                )}
              </Text>{' '}
            </RowFixed>
          </RowFixed>
          <RowFixed
            mb={20}
            ml={below600 ? '0' : '2.5rem'}
            style={{flexDirection: below1080 ? 'row-reverse' : 'initial'}}
          >
            <Link external href={getPoolLink(token0?.id, token1?.id)}>
              <ButtonLight>+ Add Liquidity</ButtonLight>
            </Link>
            <Link external href={getSwapLink(token0?.id, token1?.id)}>
              <ButtonDark ml={'.5rem'} mr={below1080 && '.5rem'}>
                Trade
              </ButtonDark>
            </Link>
          </RowFixed>
        </RowBetween>
        <AutoRow gap="6px">
          <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
            <RowFixed>
              <TokenLogo address={token0?.id} symbol={token0?.symbol} size={'16px'}/>
              <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'} color={'#ffffff'}>
                {token0 && token1
                  ? `1 ${token0?.symbol} = ${token0Rate} ${token1?.symbol} ${
                    parseFloat(token0?.derivedETH) ? '(' + token0USD + ')' : ''
                  }`
                  : '-'}
              </TYPE.main>
            </RowFixed>
          </FixedPanel>
          <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
            <RowFixed>
              <TokenLogo address={token1?.id} symbol={token1?.symbol} size={'16px'}/>
              <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'} color={'#ffffff'}>
                {token0 && token1
                  ? `1 ${token1?.symbol} = ${token1Rate} ${token0?.symbol}  ${
                    parseFloat(token1?.derivedETH) ? '(' + token1USD + ')' : ''
                  }`
                  : '-'}
              </TYPE.main>
            </RowFixed>
          </FixedPanel>
        </AutoRow>
        <DashboardWrapper>
          <>
            {!below1080 && (
              <TYPE.main fontSize={'1.125rem'} style={{marginTop: '2rem'}}>
                Pair Stats
              </TYPE.main>
            )}
            <PanelWrapper style={{marginTop: '1.5rem'}}>
              <Panel style={{height: '100%'}}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.main>
                    <div/>
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                      {getLiquidity()}
                    </TYPE.main>
                    <TYPE.main>{liquidityChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{height: '100%'}}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Volume (24hrs)</TYPE.main>
                    <div/>
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                      {volume}
                    </TYPE.main>
                    <TYPE.main>{volumeChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{height: '100%'}}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>
                      Fees (24hrs)
                      <Question style={{marginLeft: 2}} text="0.15 percent swap earning + LP slippage profit"/>
                    </TYPE.main>
                    <div/>
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                      {oneDayVolumeUSD
                        ? !oneDayExtraFee || oneDayExtraFee <= 0
                          ? formattedNum(oneDayVolumeUSD * 0.0015, true)
                          : formattedNum(oneDayVolumeUSD * 0.0015, true) + ' + ' + formattedNum(oneDayExtraFee, true)
                        : oneDayVolumeUSD === 0
                          ? '$0'
                          : '-'}
                    </TYPE.main>
                    <TYPE.main>{!oneDayExtraFee || oneDayExtraFee <= 0 ? volumeChange : feePercentChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{height: '100%'}}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Transactions (24hrs)</TYPE.main>
                    <div/>
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'2rem'} lineHeight={1} fontWeight={600}>
                      {oneDayTxns ?? '-'}
                    </TYPE.main>
                    <TYPE.main>{txnChangeFormatted}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{height: '100%'}}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Pooled Tokens</TYPE.main>
                    <div/>
                  </RowBetween>
                  <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true}>
                    <AutoRow gap="4px">
                      <TokenLogo address={token0?.id} symbol={token0?.symbol}/>
                      <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                        {reserve0 ? formattedNum(reserve0) : ''} {token0?.symbol ?? ''}
                      </TYPE.main>
                    </AutoRow>
                  </Hover>
                  <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                    <AutoRow gap="4px">
                      <TokenLogo address={token1?.id} symbol={token1?.symbol}/>
                      <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                        {reserve1 ? formattedNum(reserve1) : ''} {token1?.symbol ?? ''}
                      </TYPE.main>
                    </AutoRow>
                  </Hover>
                </AutoColumn>
              </Panel>
              <Panel style={{gridColumn: below1080 ? '1' : '2/4', gridRow: below1080 ? '' : '1/6'}}>
                <PairChart address={pairAddress} color={backgroundColor}/>
              </Panel>
            </PanelWrapper>
            <Panel
              style={{
                border: '1px solid #4A4757',
                marginTop: '3rem'
              }}
            >
              <TYPE.main fontSize={'1.125rem'} style={{marginBottom: '1.5rem'}}>
                Transactions
              </TYPE.main>{' '}
              {transactions ? <TxnList transactions={transactions}/> : <Loader/>}
            </Panel>
            <Panel
              rounded
              style={{
                border: '1px solid #4A4757',
                marginTop: '3rem'
              }}
              p={20}
            >
              <RowBetween style={{marginBottom: '1.5rem'}}>
                <TYPE.main fontSize={'1.125rem'}>Pair Information</TYPE.main>{' '}
              </RowBetween>

              <TokenDetailsLayout>
                <Column>
                  <TYPE.main>Pair Name</TYPE.main>
                  <Text style={{marginTop: '.5rem'}} fontSize={24} fontWeight="500">
                    {token0 && token1 ? token0.symbol + '-' + token1.symbol : ''}
                  </Text>
                </Column>

                <Column>
                  <TYPE.main>Pair Address</TYPE.main>
                  <AutoRow align="flex-end">
                    <Text style={{marginTop: '.5rem'}} fontSize={24} fontWeight="500">
                      {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                    </Text>
                    <CopyHelper toCopy={pairAddress}/>
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>{token0 && token0.symbol + ' Address'}</TYPE.main>
                  <AutoRow align="flex-end">
                    <Text style={{marginTop: '.5rem'}} fontSize={24} fontWeight="500">
                      {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                    </Text>
                    <CopyHelper toCopy={token0?.id}/>
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>{token1 && token1.symbol + ' Address'}</TYPE.main>
                  <AutoRow align="flex-end">
                    <Text style={{marginTop: '.5rem'}} fontSize={24} fontWeight="500">
                      {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                    </Text>
                    <CopyHelper toCopy={token1?.id}/>
                  </AutoRow>
                </Column>
                <ButtonLight>
                  <Link color={backgroundColor} external href={`https://${scanUrl}/address/` + pairAddress}>
                    View on {scanName} ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </>
        </DashboardWrapper>
      </WarningGrouping>
    </PageWrapper>
  )
}

export default withRouter(PairPage)
