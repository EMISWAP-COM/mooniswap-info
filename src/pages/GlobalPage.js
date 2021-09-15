import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import 'feather-icons'
import {Box} from 'rebass'
import styled from 'styled-components/macro'

import {AutoRow, RowBetween} from '../components/Row'
import {AutoColumn} from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import TxnList from '../components/TxnList'
import GlobalChart from '../components/GlobalChart'
import {Hover, TYPE} from '../Theme'
import {ETH, formattedNum, formattedPercent, getLiquidityFromToken} from '../helpers'
import {useEthPrice, useGlobalData, useGlobalTransactions} from '../contexts/GlobalData'
import {useAllPairData} from '../contexts/PairData'
import {Search} from '../components/Search'
import {useMedia} from 'react-use'
import TokenLogo from '../components/TokenLogo'
import Panel from '../components/Panel'
import {useAllTokenData} from '../contexts/TokenData'
import UniPrice from '../components/UniPrice'
import {useNetworkData} from "../hooks";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  width: calc(100% - 20px);
  & > * {
    width: 100%;
    max-width: 1240px;
  }

  @media screen and (max-width: 1080px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`

const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200vh;
  max-width: 100vw;
  z-index: -1;

  transform: translateY(-70vh);
  background: ${({ theme }) => theme.background};
`

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: 50% 50%;
  column-gap: 6px;
  align-items: start;
  justify-content: center;
`

const TopGroup = styled.div`
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const ChartWrapper = styled.div`
  height: 100%;
`

const TopPanel = styled(Panel)`
  height: 100px;
`

const LIST_VIEW = {
  TOKENS: 'tokens',
  PAIRS: 'pairs'
}

function GlobalPage({ history }) {
  const [listView, setListView] = useState(LIST_VIEW.PAIRS)

  const {
    // totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange
  } = useGlobalData()

  const transactions = useGlobalTransactions()

  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()

  // console.log(allTokens);

  const [ethPrice, ethPriceOld] = useEthPrice()

  const ethPriceChange = (parseFloat(ethPrice - ethPriceOld) / parseFloat(ethPriceOld)) * 100

  // const liquidity = totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'

  const liquidityChange = liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'

  // const volume = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'

  const volumeChange = volumeChangeUSD ? formattedPercent(volumeChangeUSD) : '-'

  let txnChangeFormatted = txnChange ? formattedPercent(txnChange) : '-'

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const [showPriceCard, setShowPriceCard] = useState(false)

  const {priceText} = useNetworkData();

  const getCalculatedLiquidity = () => {
    let total = 0;
    for (const prop in allPairs) {
      const pair = allPairs[prop];
      if (pair.reserveUSD === "0") {
        const token0USD = getLiquidityFromToken(pair.token0, pair.reserve0, ethPrice);
        const token1USD = getLiquidityFromToken(pair.token1, pair.reserve1, ethPrice);
        total += (token0USD + token1USD);
      } else {
        total += parseFloat(pair.reserveUSD);
      }
    }
    return formattedNum(total, true);
  }

  const getCalculatedVolume = () => {
    let total = 0;
    for (const prop in allPairs) {
      const pair = allPairs[prop];
      total += parseFloat(pair.oneDayVolumeUSD);
    }
    return formattedNum(total, true);
  }

  const getFormattedEthPrice = () => {
    // Подсчет курса из прямой пары
    /*for (const prop in allPairs) {
      if (allPairs[prop].token0.symbol === 'ESW' && allPairs[prop].token1.symbol === 'USDT') {
        return formattedNum(allPairs[prop].token1Price, true);
      } else if (allPairs[prop].token0.symbol === 'USDT' && allPairs[prop].token1.symbol === 'ESW') {
        return formattedNum(allPairs[prop].token0Price, true);
      }
    }*/

    let price = '-';
    if (ethPrice) {
      price = formattedNum(ethPrice, true);
    }
    return !price || price === '$0' ? '-' : price;
  };

  return (
    <PageWrapper>
      <ThemedBackground />
      <Search small={!!below600} />
      {below1080 && ( // mobile card
        <Box mb={20}>
          <Box mb={20} mt={'1.5rem'}>
            <Panel>
              <Box>
                <AutoColumn gap="40px">
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main color="#89919A">Volume (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {getCalculatedVolume()}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main color="#89919A">Total Liquidity</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {/*{liquidity && liquidity}*/}
                        {getCalculatedLiquidity()}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{liquidityChange && liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.main color="#89919A">Transactions (24hrs)</TYPE.main>
                      <div />
                    </RowBetween>
                    <RowBetween align="flex-end">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                        {!!oneDayTxns ? oneDayTxns : '-'}
                      </TYPE.main>
                      <TYPE.main fontSize={12}>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </AutoColumn>
              </Box>
            </Panel>
          </Box>
          <Box>
            <Panel>
              <ChartWrapper area="fill" rounded>
                <GlobalChart />
              </ChartWrapper>
            </Panel>
          </Box>
        </Box>
      )}
      {!below1080 && ( // desktop
        <TopGroup style={{ marginTop: '3.5rem' }}>
          <TopPanel
            hover={true}
            onMouseEnter={() => {
              setShowPriceCard(true)
            }}
            onMouseLeave={() => {
              setShowPriceCard(false)
            }}
          >
            {showPriceCard && (
              <UniPrice />
            )}
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main color="#89919A">{priceText}</TYPE.main>
                {false && (
                  <TokenLogo address={ETH} />
                )}
              </RowBetween>
              <RowBetween align="flex-end">
                {getFormattedEthPrice() && (
                  <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                    {getFormattedEthPrice()}
                  </TYPE.main>
                )}
                {formattedPercent(ethPriceChange)}
              </RowBetween>
            </AutoColumn>
          </TopPanel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main color="#89919A">Total Liquidity</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                  {/*{liquidity && liquidity}*/}
                  {getCalculatedLiquidity()}
                </TYPE.main>
                <TYPE.main fontSize={14}>{liquidityChange && liquidityChange}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main color="#89919A">Volume (24hrs)</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                  {getCalculatedVolume()}
                </TYPE.main>
                <TYPE.main fontSize={14}>{volumeChange}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.main color="#89919A">Transactions (24hrs)</TYPE.main>
                <div />
              </RowBetween>
              <RowBetween align="flex-end">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                  {oneDayTxns}
                </TYPE.main>
                <TYPE.main fontSize={14}>{txnChangeFormatted && txnChangeFormatted}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
        </TopGroup>
      )}

      {!below1080 && (
        <GridRow style={{ marginTop: '6px' }}>
          <Panel style={{ height: '100%', minHeight: '300px' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="liquidity" />
            </ChartWrapper>
          </Panel>
          <Panel style={{ height: '100%' }}>
            <ChartWrapper area="fill" rounded>
              <GlobalChart display="volume" />
            </ChartWrapper>
          </Panel>
        </GridRow>
      )}

      <Panel style={{ marginTop: '2rem' }}>
        <ListOptions gap="10px" style={{ marginTop: '6px', marginBottom: '1rem' }}>
          <Hover>
            <TYPE.main
              onClick={() => {
                setListView(LIST_VIEW.PAIRS)
              }}
              fontSize={'1.125rem'}
              color={listView === LIST_VIEW.TOKENS ? '#B7B7CA' : 'white'}
            >
              Pairs
            </TYPE.main>
          </Hover>
          <Hover>
            <TYPE.main
              onClick={() => {
                setListView(LIST_VIEW.TOKENS)
              }}
              fontSize={'1.125rem'}
              color={listView === LIST_VIEW.PAIRS ? '#B7B7CA' : 'white'}
            >
              Tokens
            </TYPE.main>
          </Hover>
        </ListOptions>

        {listView === LIST_VIEW.PAIRS
          ? <PairList pairs={allPairs} />
          : <TopTokenList tokens={allTokens} pairs={allPairs} />
        }
      </Panel>

      <Panel style={{ margin: '2rem 0' }}>
        <TYPE.main fontSize={'1.125rem'} style={{ marginBottom: '1rem' }}>
          Transactions
        </TYPE.main>
        <TxnList transactions={transactions} />
      </Panel>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
