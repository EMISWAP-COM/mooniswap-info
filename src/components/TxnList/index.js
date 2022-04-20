import React, {useState, useEffect, useCallback} from 'react'
import styled from 'styled-components/macro'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { formatTime, formattedNum, getIsValidNumber } from '../../helpers'
import { useMedia } from 'react-use'
import { RowFixed, RowBetween } from '../Row'

import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import Link from '../Link'
import { Divider, EmptyCard } from '..'
import DropdownSelect from '../DropdownSelect'
import {PAGES} from '../../constants'
import Pagination from '../Pagination'
import {useEthPrice} from "../../contexts/GlobalData";
import {useIsAstarNetwork, useIsShidenNetwork, useNetworkData, useUrls} from "../../hooks";
import {useAllTokenData} from "../../contexts/TokenData";

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
  grid-template-areas: 'txn value time';

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 500px) {
    > * {
      &:first-child {
        width: 280px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther time';

    > * {
      &:first-child {
        width: 280px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    max-width: 1320px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther account time';
  }
`

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  color: ${({theme}) => theme.text2};
  user-select: none;
  text-align: end;

  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: right;

  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }
`

const SortText = styled.button`
  cursor: pointer;
  font-weight: ${({ active, }) => (active ? 500 : 400)};
  margin-right: 0.5rem !important;
  border: none;
  background-color: ${({ theme, active }) => (active ? theme.active : theme.btn1)};
  border-radius: 6px;
  font-size: 1rem;
  color: ${({ theme, active }) => (active ? 'white' : 'white')};
  outline: none;
  padding: 6px 12px;

  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`

const SORT_FIELD = {
  VALUE: 'amountUSD',
  AMOUNT0: 'token0Amount',
  AMOUNT1: 'token1Amount',
  TIMESTAMP: 'timestamp'
}

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes'
}

const ITEMS_PER_PAGE = 10

function getTransactionType(event, symbol0, symbol1) {
  switch (event) {
    case TXN_TYPE.ADD:
      return 'Add ' + symbol0 + ' and ' + symbol1
    case TXN_TYPE.REMOVE:
      return 'Remove ' + symbol0 + ' and ' + symbol1
    case TXN_TYPE.SWAP:
      return 'Swap ' + symbol0 + ' for ' + symbol1
    default:
      return ''
  }
}

// @TODO rework into virtualized list
function TxnList({ transactions, symbol0Override, symbol1Override, color }) {

  const {scanUrl} = useNetworkData();
  const isShidenNetwork = useIsShidenNetwork();
  const isAstarNetwork = useIsAstarNetwork();
  const urls = useUrls();
  const [ethPrice] = useEthPrice();

  const allTokens = useAllTokenData();

  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP)
  const [filteredItems, setFilteredItems] = useState()
  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL)

  // console.log(tokens);

  const getAmountUSD = useCallback((amountUSD, transaction, txn) => {
    if (amountUSD && transaction && txn) {
      const token0Data = allTokens[transaction.pair.token0.id];
      const token1Data = allTokens[transaction.pair.token1.id];

      if (token0Data) {
        console.log(token0Data.derivedETH, token1Data.derivedETH);
      }

      if ((amountUSD === "0" || isShidenNetwork || isAstarNetwork) && ethPrice && token0Data && token1Data) {
        return (token0Data.priceUSD * txn.token0Amount) + (token1Data.priceUSD * txn.token1Amount);
      }
    }

    return amountUSD;
  }, [ethPrice, allTokens, isShidenNetwork, isAstarNetwork])

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [transactions])

  // parse the txns and format for UI
  useEffect(() => {
    if (transactions && transactions.mints && transactions.burns && transactions.swaps) {
      let newTxns = []
      if (transactions.mints.length > 0) {
        transactions.mints.forEach(mint => {
          // for referrals
          if (mint.amount0 === '0') {
            return true
          }
          if (mint.pair.token0.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
            mint.pair.token0.symbol = 'yCRV'
          }
          if (mint.pair.token1.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
            mint.pair.token1.symbol = 'yCRV'
          }
          let newTxn = {}
          newTxn.hash = mint.transaction.id
          newTxn.timestamp = mint.transaction.timestamp
          newTxn.type = TXN_TYPE.ADD
          newTxn.token0Amount = mint.amount0
          newTxn.token1Amount = mint.amount1
          newTxn.account = mint.sender
          newTxn.token0Symbol = mint.pair.token0.symbol
          newTxn.token1Symbol = mint.pair.token1.symbol
          newTxn.amountUSD = getAmountUSD(mint.amountUSD, mint, newTxn)
          return newTxns.push(newTxn)
        })
      }
      if (transactions.burns.length > 0) {
        transactions.burns.forEach(burn => {
          let newTxn = {}
          if (burn.pair.token0.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
            burn.pair.token0.symbol = 'yCRV'
          }
          if (burn.pair.token1.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
            burn.pair.token1.symbol = 'yCRV'
          }
          newTxn.hash = burn.transaction.id
          newTxn.timestamp = burn.transaction.timestamp
          newTxn.type = TXN_TYPE.REMOVE
          newTxn.token0Amount = burn.amount0
          newTxn.token1Amount = burn.amount1
          newTxn.account = burn.sender
          newTxn.token0Symbol = burn.pair.token0.symbol
          newTxn.token1Symbol = burn.pair.token1.symbol
          newTxn.amountUSD = getAmountUSD(burn.amountUSD, burn, newTxn)
          return newTxns.push(newTxn)
        })
      }
      if (transactions.swaps.length > 0) {
        transactions.swaps.map(swap => {
          const isSrcFirst = swap.pair.token0.id === swap.src
          const srcAmount = swap.srcAmount
          const destAmount = swap.destAmount

          if (swap.pair.token0.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
            swap.pair.token0.symbol = 'yCRV'
          }
          if (swap.pair.token1.id === '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8') {
            swap.pair.token1.symbol = 'yCRV'
          }

          let newTxn = {}
          if (isSrcFirst) {
            newTxn.token0Symbol = swap.pair.token0.symbol
            newTxn.token1Symbol = swap.pair.token1.symbol
          } else {
            newTxn.token0Symbol = swap.pair.token1.symbol
            newTxn.token1Symbol = swap.pair.token0.symbol
          }
          newTxn.token0Amount = Math.abs(srcAmount)
          newTxn.token1Amount = Math.abs(destAmount)

          newTxn.hash = swap.transaction.id
          newTxn.timestamp = swap.transaction.timestamp
          newTxn.type = TXN_TYPE.SWAP

          newTxn.amountUSD = getAmountUSD(swap.amountUSD, swap, newTxn)
          newTxn.account = swap.sender

          return newTxns.push(newTxn)
        })
      }

      const filtered = newTxns.filter(item => {
        if (txFilter !== TXN_TYPE.ALL) {
          return item.type === txFilter
        }
        return true
      })
      setFilteredItems(filtered)
      let extraPages = 1
      if (filtered.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      if (filtered.length === 0) {
        setMaxPage(1)
      } else {
        setMaxPage(Math.floor(filtered.length / ITEMS_PER_PAGE) + extraPages)
      }
    }
  }, [transactions, txFilter, getAmountUSD])

  useEffect(() => {
    setPage(1)
  }, [txFilter])

  const filteredList =
    filteredItems &&
    filteredItems
      .sort((a, b) => {
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)

  const below1080 = useMedia('(max-width: 1080px)')
  const below780 = useMedia('(max-width: 780px)')

  const ListItem = ({ item }) => {
    // console.log(item);

    return (
      <DashGrid style={{ height: '60px' }}>
        <DataText area="txn" fontWeight="500">
          <Link color={color} external href={urls.showTransaction(item.hash)}>
            {getTransactionType(item.type, item.token0Symbol, item.token1Symbol)}
          </Link>
        </DataText>
        <DataText area="value">
          {formattedNum(item.amountUSD, true)}
        </DataText>
        {!below780 && (
          <>
            <DataText area="amountOther">{formattedNum(item.token0Amount) + ' ' + item.token0Symbol}</DataText>
            <DataText area="amountToken">{formattedNum(item.token1Amount) + ' ' + item.token1Symbol}</DataText>
          </>
        )}
        {!below1080 && (
          <DataText area="account">
            <Link color={color} external href={`https://${scanUrl}/address/` + item.account}>
              {item.account && item.account.slice(0, 6) + '...' + item.account.slice(38, 42)}
            </Link>
          </DataText>
        )}
        <DataText area="time">{formatTime(item.timestamp)}</DataText>
      </DashGrid>
    )
  }

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
    <>
      <DashGrid center={true} style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
        {below780 ? (
          <RowBetween area="txn">
            <DropdownSelect options={TXN_TYPE} active={txFilter} setActive={setTxFilter} color={color} />
          </RowBetween>
        ) : (
          <RowFixed area="txn" gap="10px" pl={4}>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.ALL)
              }}
              active={txFilter === TXN_TYPE.ALL}
            >
              All
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.SWAP)
              }}
              active={txFilter === TXN_TYPE.SWAP}
            >
              Swaps
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.ADD)
              }}
              active={txFilter === TXN_TYPE.ADD}
            >
              Adds
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TXN_TYPE.REMOVE)
              }}
              active={txFilter === TXN_TYPE.REMOVE}
            >
              Removes
            </SortText>
          </RowFixed>
        )}

        <Flex alignItems="center" justifyContent="flexStart">
          <ClickableText
            color="#B7B7CA"
            area="value"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VALUE)
              setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
            }}
          >
            Total Value {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below780 && (
          <Flex alignItems="center">
            <ClickableText
              area="amountToken"
              color="#B7B7CA"
              onClick={() => {
                setSortedColumn(SORT_FIELD.AMOUNT0)
                setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT0 ? true : !sortDirection)
              }}
            >
              {symbol0Override ? symbol0Override + ' Amount' : 'Token Amount'}{' '}
              {sortedColumn === SORT_FIELD.AMOUNT0 ? (sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <>
          {!below780 && (
            <Flex alignItems="center">
              <ClickableText
                area="amountOther"
                color="#B7B7CA"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT1)
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT1 ? true : !sortDirection)
                }}
              >
                {symbol1Override ? symbol1Override + ' Amount' : 'Token Amount'}{' '}
                {sortedColumn === SORT_FIELD.AMOUNT1 ? (sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          )}
          {!below1080 && (
            <Flex alignItems="center">
              <Text area="account" color="#B7B7CA">
                Account
              </Text>
            </Flex>
          )}
          <Flex alignItems="center">
            <ClickableText
              area="time"
              color="#B7B7CA"
              onClick={() => {
                setSortedColumn(SORT_FIELD.TIMESTAMP)
                setSortDirection(sortedColumn !== SORT_FIELD.TIMESTAMP ? true : !sortDirection)
              }}
            >
              Time {sortedColumn === SORT_FIELD.TIMESTAMP ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        </>
      </DashGrid>
      <Divider />
      <List p={0}>
        {!filteredList ? (
          <LocalLoader />
        ) : filteredList.length === 0 ? (
          <EmptyCard>No recent transactions found.</EmptyCard>
        ) : (
          filteredList.map((item, index) => {
            return (
              <div key={index}>
                <ListItem key={index} index={index + 1} item={item} />
                <Divider />
              </div>
            )
          })
        )}
      </List>
      {filteredList?.length > 0 && (
        <PageButtons>
          <Pagination page={page} lastPage={maxPage} onClick={handlePageChange} />
        </PageButtons>
      )}
    </>
  )
}

export default TxnList
