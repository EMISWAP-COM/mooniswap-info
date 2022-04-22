import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

import { client } from '../apollo/client'
import { FILTERED_TRANSACTIONS, TOKEN_CHART, TOKEN_DATA, TOKENS_CURRENT, TOKENS_DYNAMIC } from '../apollo/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { ETH, get2DayPercentChange, getBlockFromTimestamp, getPercentChange, isAddress } from '../helpers'
import { SURPRESS_WARNINGS } from '../constants'

const UPDATE = 'UPDATE'
const UPDATE_VERIFIED_TOKENS = 'VERIFIED_TOKENS_UPDATE'
const UPDATE_TOKEN_TXNS = 'UPDATE_TOKEN_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_TOP_TOKENS = ' UPDATE_TOP_TOKENS'
const UPDATE_ALL_PAIRS = 'UPDATE_ALL_PAIRS'

const TOKEN_PAIRS_KEY = 'TOKEN_PAIRS_KEY'

dayjs.extend(utc)

const TokenDataContext = createContext()

function useTokenDataContext() {
  return useContext(TokenDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data } = payload
      return {
        ...state,
        [tokenAddress]: {
          ...state?.[tokenAddress],
          ...data
        }
      }
    }
    case UPDATE_VERIFIED_TOKENS: {
      const { verifiedTokens } = payload
      return {
        ...state,
        verifiedTokens
      }
    }
    case UPDATE_TOP_TOKENS: {
      const { topTokens } = payload
      let added = {}
      topTokens &&
        topTokens.map(token => {
          return (added[token.id] = token)
        })
      return {
        ...state,
        ...added
      }
    }

    case UPDATE_TOKEN_TXNS: {
      const { address, transactions } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          txns: transactions
        }
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          chartData
        }
      }
    }
    case UPDATE_ALL_PAIRS: {
      const { address, allPairs } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          [TOKEN_PAIRS_KEY]: allPairs
        }
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((tokenAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data
      }
    })
  }, [])

  const updateVerifiedTokens = useCallback(verifiedTokens => {
    dispatch({
      type: UPDATE_VERIFIED_TOKENS,
      payload: {
        verifiedTokens
      }
    })
  }, [])

  const updateTopTokens = useCallback(topTokens => {
    dispatch({
      type: UPDATE_TOP_TOKENS,
      payload: {
        topTokens
      }
    })
  }, [])

  const updateTokenTxns = useCallback((address, transactions) => {
    dispatch({
      type: UPDATE_TOKEN_TXNS,
      payload: { address, transactions }
    })
  }, [])

  const updateChartData = useCallback((address, chartData) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData }
    })
  }, [])

  const updateAllPairs = useCallback((address, allPairs) => {
    dispatch({
      type: UPDATE_ALL_PAIRS,
      payload: { address, allPairs }
    })
  }, [])

  return (
    <TokenDataContext.Provider
      value={useMemo(
        () => [
          state,
          { update, updateTokenTxns, updateChartData, updateTopTokens, updateAllPairs, updateVerifiedTokens }
        ],
        [state, update, updateTokenTxns, updateChartData, updateTopTokens, updateAllPairs, updateVerifiedTokens]
      )}
    >
      {children}
    </TokenDataContext.Provider>
  )
}

const getTopTokens = async (ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  try {
    let current = await client.query({
      query: TOKENS_CURRENT,
      fetchPolicy: 'cache-first'
    })

    let oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock),
      fetchPolicy: 'cache-first'
    })

    let twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock),
      fetchPolicy: 'cache-first'
    })

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async token => {
          let data = token

          let oneDayHistory = oneDayData?.[token.id]
          let twoDayHistory = twoDayData?.[token.id]

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            let oneDayResult = await client.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
              fetchPolicy: 'cache-first'
            })
            oneDayHistory = oneDayResult.data.tokens[0]
          }
          if (!twoDayHistory) {
            let twoDayResult = await client.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
              fetchPolicy: 'cache-first'
            })
            twoDayHistory = twoDayResult.data.tokens[0]
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0
          )

          const [oneDayTxns, txnChange] = get2DayPercentChange(
            data.txCount,
            oneDayHistory?.txCount ?? 0,
            twoDayHistory?.txCount ?? 0
          )

          const priceUSD = data.derivedETH && ethPrice ? (data.derivedETH * ethPrice) : data.derivedUSD
          const oneDayPriceUSD = oneDayHistory?.derivedETH && ethPrice ? (oneDayHistory?.derivedETH * ethPrice) : oneDayHistory?.derivedUSD
          const priceChangeUSD = getPercentChange(priceUSD, oneDayPriceUSD ?? 0)

          const totalLiquidityUSD = data.totalLiquidityUSD
            ? data.totalLiquidityUSD
            : (data?.totalLiquidity * ethPrice * data?.derivedETH)
          const oneDayHistoryLiquidityUSD = oneDayHistory?.totalLiquidityUSD
            ? oneDayHistory.totalLiquidityUSD
            : (oneDayHistory?.totalLiquidity * ethPrice * oneDayHistory?.derivedETH)
          const liquidityChangeUSD = getPercentChange(totalLiquidityUSD, oneDayHistoryLiquidityUSD ?? 0)

          // set data
          data.priceUSD = priceUSD
          data.totalLiquidityUSD = totalLiquidityUSD
          data.oneDayVolumeUSD = oneDayVolumeUSD
          data.volumeChangeUSD = volumeChangeUSD
          data.priceChangeUSD = priceChangeUSD
          data.liquidityChangeUSD = liquidityChangeUSD
          data.oneDayTxns = oneDayTxns
          data.txnChange = txnChange

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
            data.oneDayTxns = data.txCount
          }

          if (data.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
            data.name = 'Ether (Wrapped)'
            data.symbol = 'ETH'
          }

          if (data.id === '0x4446fc4eb47f2f6586f9faab68b3498f86c07521') {
            data.name = 'KuCoin (Wrapped)'
            data.symbol = 'KCS'
          }

          if (data.id === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270') {
            data.name = 'Matic (Wrapped)'
            data.symbol = 'MATIC'
          }

          if (data.id === '0x0f933dc137d21ca519ae4c7e93f87a4c8ef365ef') {
            data.name = 'Shiden (Wrapped)'
            data.symbol = 'SDN'
          }

          if (data.id === '0x672f30407A71fa8737A3A14474ff37E09c7Fc44a') {
            data.name = 'GateChain (Wrapped)'
            data.symbol = 'GT'
          }

          return data
        })
    )

    return bulkResults

    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e)
  }
}

const getTokenData = async (address, ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix()
  const utcTwoDaysBack = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  // initialize data arrays
  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(address),
      fetchPolicy: 'cache-first'
    })
    data = result?.data?.tokens?.[0]

    // get results from 24 hours in past
    let oneDayResult = await client.query({
      query: TOKEN_DATA(address, oneDayBlock),
      fetchPolicy: 'cache-first'
    })
    oneDayData = oneDayResult.data.tokens[0]

    // get results from 48 hours in past
    let twoDayResult = await client.query({
      query: TOKEN_DATA(address, twoDayBlock),
      fetchPolicy: 'cache-first'
    })
    twoDayData = twoDayResult.data.tokens[0]

    // catch the case where token wasnt in top list in previous days
    if (!oneDayData) {
      let oneDayResult = await client.query({
        query: TOKEN_DATA(address, oneDayBlock),
        fetchPolicy: 'cache-first'
      })
      oneDayData = oneDayResult.data.tokens[0]
    }
    if (!twoDayData) {
      let twoDayResult = await client.query({
        query: TOKEN_DATA(address, twoDayBlock),
        fetchPolicy: 'cache-first'
      })
      twoDayData = twoDayResult.data.tokens[0]
    }

    // calculate percentage changes and daily changes
    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      data.tradeVolumeUSD,
      oneDayData?.tradeVolumeUSD ?? 0,
      twoDayData?.tradeVolumeUSD ?? 0
    )

    // calculate percentage changes and daily changes
    const [oneDayTxns, txnChange] = get2DayPercentChange(
      data.txCount,
      oneDayData?.txCount ?? 0,
      twoDayData?.txCount ?? 0
    )

    const priceUSD = data.derivedETH && ethPrice ? (data.derivedETH * ethPrice) : data.derivedUSD
    const oneDayPriceUSD = oneDayData.derivedETH && ethPrice ? (oneDayData.derivedETH * ethPrice) : oneDayData.derivedUSD
    const priceChangeUSD = getPercentChange(priceUSD, oneDayPriceUSD ?? 0)

    const totalLiquidityUSD = data.totalLiquidityUSD
      ? data.totalLiquidityUSD
      : (data?.totalLiquidity * ethPrice * data?.derivedETH)
    const oneDayDataLiquidityUSD = oneDayData.totalLiquidityUSD
      ? oneDayData.totalLiquidityUSD
      : (oneDayData?.totalLiquidity * ethPrice * oneDayData?.derivedETH)
    const liquidityChangeUSD = getPercentChange(totalLiquidityUSD, oneDayDataLiquidityUSD ?? 0)

    // set data
    data.priceUSD = priceUSD
    data.totalLiquidityUSD = totalLiquidityUSD
    data.oneDayVolumeUSD = oneDayVolumeUSD
    data.volumeChangeUSD = volumeChangeUSD
    data.priceChangeUSD = priceChangeUSD
    data.liquidityChangeUSD = liquidityChangeUSD
    data.oneDayTxns = oneDayTxns
    data.txnChange = txnChange

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
      data.oneDayTxns = data.txCount
    }

    // if (data.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
    //   data.name = 'ETH (Wrapped)'
    //   data.symbol = 'ETH'
    // }
  } catch (e) {
    console.log(e)
  }
  return data
}

const getTokenTransactions = async allPairsFormatted => {
  const transactions = {}
  try {
    let result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: allPairsFormatted
      },
      fetchPolicy: 'cache-first'
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }
  return transactions
}

const getVerifiedTokens = async () => {
  try {
    // const res = await fetch('http://tokens.1inch.eth.link');
    const res = await fetch('https://gateway.ipfs.io/ipfs/QmbrAQYoLLUxQcDyVLyJ2mcUYRFVQai3u4eLWJkBj9C8pU')
    const tokens = (await res.json()).tokens.map(x => x.address.toLowerCase())
    tokens.push(ETH)
    return tokens
  } catch (e) {
    return SURPRESS_WARNINGS
  }
}

const getTokenPairs = async tokenAddress => {
  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(tokenAddress),
      fetchPolicy: 'cache-first'
    })
    return result.data?.['pairs0'].concat(result.data?.['pairs1'])
  } catch (e) {
    console.log(e)
  }
}

const getTokenChartData = async tokenAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year')
  let startTime = utcStartTime.startOf('minute').unix() - 1

  try {
    let result = await client.query({
      query: TOKEN_CHART,
      variables: {
        tokenAddr: tokenAddress
      },
      fetchPolicy: 'cache-first'
    })
    data = data.concat(result.data.tokenDayDatas)
    let dayIndexSet = new Set()
    let dayIndexArray = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)

      // hot fixes until version without unibomb
      // if (dayData.date === 1592352000 && tokenAddress === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      //   dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD) - 92675072
      // }
      // if (dayData.date === 1592438400 && tokenAddress === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      //   dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD) - 46360757
      // }
      // if (dayData.date === 1592524800 && tokenAddress === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      //   dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD) - 45616105
      // }
    })
    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD
    let latestPriceUSD = data[0] && data[0].priceUSD
    let latestPairDatas = data[0] && data[0].mostLiquidPairs
    let index = 1
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay
      let currentDayIndex = (nextDay / oneDay).toFixed(0)
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          mostLiquidPairs: latestPairDatas
        })
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
        latestPriceUSD = dayIndexArray[index].priceUSD
        latestPairDatas = dayIndexArray[index].mostLiquidPairs
        index = index + 1
      }
      timestamp = nextDay
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }
  return data
}

export function Updater() {
  const [, { updateTopTokens }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(ethPrice, ethPriceOld)
      topTokens && updateTopTokens(topTokens)
    }
    ethPrice && ethPriceOld && getData()
  }, [ethPrice, ethPriceOld, updateTopTokens])
  return null
}

export function useTokenData(tokenAddress) {
  const [state, { update }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  const tokenData = state?.[tokenAddress]

  useEffect(() => {
    if (!tokenData && ethPrice && ethPriceOld && isAddress(tokenAddress)) {
      getTokenData(tokenAddress, ethPrice, ethPriceOld).then(data => {
        update(tokenAddress, data)
      })
    }
  }, [ethPrice, ethPriceOld, tokenAddress, tokenData, update])

  return tokenData || {}
}

export function useVerifiedTokens() {
  const [state, { updateVerifiedTokens }] = useTokenDataContext()

  useMemo(() => {
    if (!state?.verifiedTokens) {
      getVerifiedTokens().then(tokens => {
        updateVerifiedTokens(tokens)
      })
    }
  }, [state, updateVerifiedTokens])

  return state?.verifiedTokens
}

export function useTokenTransactions(tokenAddress) {
  const [state, { updateTokenTxns }] = useTokenDataContext()
  const tokenTxns = state?.[tokenAddress]?.txns

  const allPairsFormatted =
    state[tokenAddress] &&
    state[tokenAddress].TOKEN_PAIRS_KEY &&
    state[tokenAddress].TOKEN_PAIRS_KEY.map(pair => {
      return pair.id
    })

  useEffect(() => {
    async function checkForTxns() {
      if (!tokenTxns && allPairsFormatted) {
        let transactions = await getTokenTransactions(allPairsFormatted)
        updateTokenTxns(tokenAddress, transactions)
      }
    }
    checkForTxns()
  }, [tokenTxns, tokenAddress, updateTokenTxns, allPairsFormatted])

  return tokenTxns || []
}

export function useTokenPairs(tokenAddress) {
  const [state, { updateAllPairs }] = useTokenDataContext()
  const tokenPairs = state?.[tokenAddress]?.[TOKEN_PAIRS_KEY]

  useEffect(() => {
    async function fetchData() {
      let allPairs = await getTokenPairs(tokenAddress)
      updateAllPairs(tokenAddress, allPairs)
    }
    if (!tokenPairs && isAddress(tokenAddress)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, updateAllPairs])

  return tokenPairs || []
}

export function useTokenChartData(tokenAddress) {
  const [state, { updateChartData }] = useTokenDataContext()
  const chartData = state?.[tokenAddress]?.chartData
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getTokenChartData(tokenAddress)
        updateChartData(tokenAddress, data)
      }
    }
    checkForChartData()
  }, [chartData, tokenAddress, updateChartData])
  return chartData
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()
  return state
}
