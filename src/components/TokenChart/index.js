import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar, CartesianGrid } from 'recharts'
import { AutoRow, RowBetween } from '../Row'

import { toK, toNiceDate, toNiceDateYear, formattedNum } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { darken } from 'polished'
import { useMedia } from 'react-use'
import { timeframeOptions } from '../../constants'
import dayjs from 'dayjs'
import { useTokenChartData } from '../../contexts/TokenData'
import DropdownSelect from '../DropdownSelect'
import {useAllTimeDate} from "../../hooks";

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 300px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  PRICE: 'Price'
}

const TokenChart = ({ address, color }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY)

  const chartData = useTokenChartData(address);
  //console.log(chartData?.filter);

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.ALL_TIME)

  const allTimeDate = useAllTimeDate(1, 'year');

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  // find start time based on required time window, update domain
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime =
        utcEndTime
          .subtract(1, 'week')
          .startOf('day')
          .unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = allTimeDate.unix() - 1
      break
    default:
      utcStartTime = allTimeDate.unix() - 1
      break
  }
  const domain = [
    dataMin => {
      const date = (dataMin > utcStartTime ? dataMin : utcStartTime);
      return chartFilter === CHART_VIEW.VOLUME ? date - (3600 * 12) : date;
    },
    'dataMax'
  ];
  const rangeData = (chartData && utcStartTime)
    ? chartData.filter(item => item.date > utcStartTime)
    : [];

  console.log(rangeData);

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartFilter} setActive={setChartFilter} color={color} />
          <DropdownSelect options={timeframeOptions} active={timeWindow} setActive={setTimeWindow} color={color} />
        </RowBetween>
      ) : (
        <RowBetween mb={40}>
          <AutoRow gap="10px">
            <OptionButton
              active={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
              isButtonGroup
            >
              Liquidity
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.VOLUME}
              onClick={() => setChartFilter(CHART_VIEW.VOLUME)}
              isButtonGroup
            >
              Volume
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.PRICE}
              onClick={() => setChartFilter(CHART_VIEW.PRICE)}
              isButtonGroup
            >
              Price
            </OptionButton>
          </AutoRow>
          <AutoRow justify="flex-end">
            <OptionButton
              active={timeWindow === timeframeOptions.WEEK}
              onClick={() => setTimeWindow(timeframeOptions.WEEK)}
              isButtonGroup
            >
              1 Week
            </OptionButton>
            <OptionButton
              active={timeWindow === timeframeOptions.ALL_TIME}
              onClick={() => setTimeWindow(timeframeOptions.ALL_TIME)}
              isButtonGroup
            >
              All Time
            </OptionButton>
          </AutoRow>
        </RowBetween>
      )}
      {chartFilter === CHART_VIEW.LIQUIDITY && rangeData && (
        <ResponsiveContainer aspect={below1080 ? 60 / 32 : below600 ? 60 / 42 : 60 / 16}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={rangeData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={120}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: '#BDBDBD' }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="left"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: '#BDBDBD' }}
              padding={{ bottom: 15 }}
            />
            <CartesianGrid stroke="#EAEEEE" vertical={false} />
            <Tooltip
              cursor={true}
              formatter={val => formattedNum(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: 'transparent',
                color: '#555959',
                boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              key={'other'}
              dataKey={'totalLiquidityUSD'}
              stackId="2"
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'Liquidity'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill="url(#colorUv)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {chartFilter === CHART_VIEW.PRICE && rangeData && (
        <ResponsiveContainer aspect={below1080 ? 60 / 32 : 60 / 16}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={rangeData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={120}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: '#BDBDBD' }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="left"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: '#BDBDBD' }}
              padding={{ bottom: 15 }}
            />
            <CartesianGrid stroke="#EAEEEE" vertical={false} />
            <Tooltip
              cursor={true}
              formatter={val => formattedNum(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: color,
                color: 'black'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              key={'other'}
              dataKey={'priceUSD'}
              stackId="2"
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'Price'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {chartFilter === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={below1080 ? 60 / 32 : 60 / 16}>
          <BarChart margin={{ top: 0, right: 10, bottom: 6, left: 10 }} barCategoryGap={1} data={rangeData}>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              type={'number'}
              domain={domain}
              tick={{ fill: '#BDBDBD' }}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={tick => '$' + toK(tick)}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: '#BDBDBD' }}
            />
            <CartesianGrid stroke="#EAEEEE" vertical={false} />
            <Tooltip
              cursor={{ fill: color, opacity: 0.1 }}
              formatter={val => formattedNum(val, true)}
              labelFormatter={label => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: color,
                color: 'black'
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar type="monotone" name={'Volume'} dataKey={'dailyVolumeUSD'} fill={color} yAxisId={0} stroke={color} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  )
}

export default TokenChart
