import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components/macro'

import Link, { CustomLink } from '../Link'
import { Divider } from '../../components'

import {
  calcIndexMargin,
  formattedNum,
  getIsValidNumber,
  getLiquidityFromToken,
  getPoolLink,
  getSwapLink
} from '../../helpers'
import DoubleTokenLogo from '../DoubleLogo'
import { ButtonLight, ButtonDark } from '../ButtonStyled'
import { withRouter } from 'react-router-dom'
import { OVERVIEW_PAIR_BLACKLIST, PAGES } from '../../constants'
import Pagination from '../Pagination'
import {useEthPrice} from "../../contexts/GlobalData";

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';

  :hover {
    cursor: ${({ focus }) => focus && 'pointer'};
    background-color: ${({ focus, theme }) => focus && theme.bg3};
    margin: 0 -20px;
    padding: 0 20px;
  }

  > * {
    justify-content: flex-end;
    width: 100%;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 740px) {
    grid-template-columns: 1.5fr 1fr 1fr ${({ disbaleLinks }) => (disbaleLinks ? '160px' : '300px')};
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr ${({ disbaleLinks }) => (disbaleLinks ? '160px' : '300px')};
    grid-template-areas: ' name liq vol volWeek fees pool ';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr ${({ disbaleLinks }) => (disbaleLinks ? '160px' : '300px')};
    grid-template-areas: ' name liq vol volWeek fees pool';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
  color: #B7B7CA;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
`

const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  TXNS: 2,
  VOL_7DAYS: 3,
  FEES: 4
}

const FIELD_TO_VALUE = {
  // trackedReserveETH - to sort with tracked volume only
  [SORT_FIELD.LIQ]: 'reserveUSD', //
  [SORT_FIELD.VOL]: 'oneDayVolumeUSD',
  [SORT_FIELD.TXNS]: 'oneDayTxns',
  [SORT_FIELD.VOL_7DAYS]: 'oneWeekVolumeUSD',
  [SORT_FIELD.FEES]: 'oneDayExtraFee'
}

function PairList({ pairs, color, history, disbaleLinks, maxItems = 10 }) {
  const [ethPrice] = useEthPrice()

  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (pairs) {
      let extraPages = 1
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, pairs])

  const ListItem = ({ pairAddress, index }) => {
    const pairData = pairs[pairAddress]

    // console.log(pairData);

    const getLiquidity = () => {
      if (pairData.reserveUSD === "0" && ethPrice) {
        const token0USD = getLiquidityFromToken(pairData.token0, pairData.reserve0, ethPrice);
        const token1USD = getLiquidityFromToken(pairData.token1, pairData.reserve1, ethPrice);

        return token0USD + token1USD;
      }

      return pairData.reserveUSD;
    }

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(getLiquidity(), true)
      const volume = formattedNum(pairData.oneDayVolumeUSD, true)

      if (pairData.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token0.name = 'ETH (Wrapped)'
        pairData.token0.symbol = 'ETH'
      }

      if (pairData.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token0.name = 'ETH (Wrapped)'
        pairData.token0.symbol = 'ETH'
      }

      if (pairData.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        pairData.token1.name = 'ETH (Wrapped)'
        pairData.token1.symbol = 'ETH'
      }

      if (pairData.token0.id === '0x4446fc4eb47f2f6586f9faab68b3498f86c07521') {
        pairData.token0.name = 'KCS (Wrapped)'
        pairData.token0.symbol = 'KCS'
      }

      if (pairData.token1.id === '0x4446fc4eb47f2f6586f9faab68b3498f86c07521') {
        pairData.token1.name = 'KCS (Wrapped)'
        pairData.token1.symbol = 'KCS'
      }

      if (pairData.token0.id === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270') {
        pairData.token0.name = 'MATIC (Wrapped)'
        pairData.token0.symbol = 'MATIC'
      }

      if (pairData.token1.id === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270') {
        pairData.token1.name = 'MATIC (Wrapped)'
        pairData.token1.symbol = 'MATIC'
      }

      if (pairData.token1.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
        pairData.token1.symbol = 'yCRV'
      }

      if (pairData.token0.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
        pairData.token1.symbol = 'yCRV'
      }

      return (
        <DashGrid
          style={{ height: '60px' }}
          disbaleLinks={disbaleLinks}
          focus={true}
          onClick={() => history.push('/pair/' + pairAddress)}
        >
          <DataText area="name" fontWeight="500">
            {!below600 && <div style={{ marginRight: `${calcIndexMargin(index)}px` }}>{index}</div>}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              margin={!below740}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <CustomLink
                style={{ marginLeft: '20px', whiteSpace: 'nowrap' }}
                to={'/pair/' + pairAddress}
                color={color}
              >
                {pairData.token0.symbol + '-' + pairData.token1.symbol}
              </CustomLink>
            </div>
          </DataText>
          <DataText area="liq">{liquidity}</DataText>
          <DataText area="vol">{volume}</DataText>
          {!below1080 && <DataText area="volWeek">{formattedNum(pairData.oneWeekVolumeUSD, true)}</DataText>}
          {!below1080 && <DataText area="fees">{formattedNum(pairData.oneDayTotalFee, true)}</DataText>}
          {!below740 &&
            (disbaleLinks ? (
              <Flex area="pool" justifyContent="flex-end" alignItems="center">
                <CustomLink color={'white'} to={'/pair/' + pairAddress}>
                  <ButtonDark color={color}>View</ButtonDark>
                </CustomLink>
              </Flex>
            ) : (
              <Flex area="pool" justifyContent="flex-end" alignItems="center">
                <Link color={color} external href={getPoolLink(pairData.token0?.id, pairData.token1?.id)}>
                  <ButtonLight color={color} style={{ marginRight: '10px' }}>
                    + Add Liquidity
                  </ButtonLight>
                </Link>
                <Link color={'white'} external href={getSwapLink(pairData.token0?.id, pairData.token1?.id)}>
                  <ButtonDark>Trade</ButtonDark>
                </Link>
              </Flex>
            ))}
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const pairList =
    pairs &&
    Object.keys(pairs)
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        return parseFloat(pairA[FIELD_TO_VALUE[sortedColumn]]) > parseFloat(pairB[FIELD_TO_VALUE[sortedColumn]])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress &&
          !OVERVIEW_PAIR_BLACKLIST.includes(pairAddress) && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * 10 + index + 1} pairAddress={pairAddress} />
              <Divider />
            </div>
          )
        )
      })

  const handlePageChange = ({ target }) => {
    const btnType = target.getAttribute('data-name')

    getIsValidNumber(btnType) ? setPage(+btnType) : handleSpecificBtnType(btnType)
  }

  const handleSpecificBtnType = btnType => {
    switch (btnType) {
      case PAGES.PREV:
        setPage(page - 1)
        break
      case PAGES.NEXT:
        setPage(page + 1)
        break
      case PAGES.FIRST:
        setPage(1)
        break
      case PAGES.LAST:
        setPage(maxPage)
        break
      default:
        break
    }
  }

  return (
    <ListWrapper>
      <DashGrid
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: 'fit-content', padding: '0 0 1rem 0', margin: 0 }}
      >
        <Flex alignItems="center" justifyContent="flexStart">
          <Text area="name" fontWeight="500">
            Name
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="liq"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="vol"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Volume (24hrs)
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="volWeek"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL_7DAYS)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
              }}
            >
              Volume (7d) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="fees"
              onClick={e => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Fees (24hr) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems="center" justifyContent="center">
            <Text area="pool"></Text>
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>{!pairList ? <LocalLoader /> : pairList}</List>
      {pairList?.length > 0 && (
        <PageButtons>
          <Pagination page={page} lastPage={maxPage} onClick={handlePageChange} />
        </PageButtons>
      )}
    </ListWrapper>
  )
}

export default withRouter(PairList)
