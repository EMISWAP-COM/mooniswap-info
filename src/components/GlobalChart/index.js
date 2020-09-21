import React, { useState, useMemo, useEffect } from 'react'
import { CartesianGrid, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import Row, { RowBetween } from '../Row'
import { toK, toNiceDate, toWeeklyDate, toNiceDateYear } from '../../helpers'
import { OptionButton } from '../ButtonStyled'
import { useMedia } from 'react-use'
import { useTimeframe } from '../../contexts/Application'
import DropdownSelect from '../DropdownSelect'
import { timeframeOptions } from '../../constants'
import { TYPE } from '../../Theme'
import { useGlobalChartData } from '../../contexts/GlobalData'
import dayjs from 'dayjs'

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity'
}

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS'
}

const GlobalChart = ({ display }) => {
  // chart options
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)

  // local window used for this chart only, global window for all data detching
  const [globalWindow, setGlobalWindow] = useTimeframe()
  const [localWindow, setLocalWindow] = useState(globalWindow)

  // global historical data
  const [chartData, weeklyData] = useGlobalChartData()

  // switch between voluem and liquidity on larger screens
  function toggleView() {
    if (chartView === CHART_VIEW.VOLUME) {
      setChartView(CHART_VIEW.LIQUIDITY)
    } else {
      setChartView(CHART_VIEW.VOLUME)
    }
  }

  let utcEndTime = dayjs.utc()
  useEffect(() => {
    setGlobalWindow(localWindow)
  }, [localWindow, setGlobalWindow])
  // based on window, get starttime
  let utcStartTime
  switch (localWindow) {
    case timeframeOptions.WEEK:
      utcStartTime =
        utcEndTime
          ?.subtract(1, 'week')
          .startOf('day')
          .unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime?.subtract(1, 'year').unix() - 1
      break
    default:
      utcStartTime =
        utcEndTime
          ?.subtract(1, 'year')
          .startOf('year')
          .unix() - 1
      break
  }

  const domain = chartData && [dataMin => (parseFloat(dataMin) > utcStartTime ? dataMin : utcStartTime), 'dataMax']

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const chartDataFiltered = useMemo(() => {
    return (
      chartData &&
      Object.keys(chartData)
        ?.map(key => {
          let item = chartData[key]
          if (item.date > utcStartTime) {
            return item
          } else {
            return
          }
        })
        .filter(item => {
          return !!item
        })
    )
  }, [chartData, utcStartTime])

  return chartData ? (
    <>
      {below600 ? (
        <RowBetween mb={40}>
          <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#11B382'} />
          <DropdownSelect
            options={timeframeOptions}
            active={localWindow}
            setActive={setLocalWindow}
            color={'#11B382'}
          />
        </RowBetween>
      ) : (
        <RowBetween marginBottom={'10px'}>
          <Row>
            <OptionButton
              style={{ marginRight: '10px', paddingLeft: '0px' }}
              active={chartView === CHART_VIEW.LIQUIDITY}
              onClick={!display ? toggleView : () => {}}
              disabled={!!display}
            >
              <TYPE.main fontSize={20}>{chartView}</TYPE.main>
            </OptionButton>
          </Row>
          <Row justify="flex-end">
            {chartView === CHART_VIEW.VOLUME && (
              <OptionButton
                style={{ marginRight: '0px' }}
                active={volumeWindow === VOLUME_WINDOW.DAYS}
                onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}
                isButtonGroup
              >
                Daily
              </OptionButton>
            )}
            {chartView === CHART_VIEW.VOLUME && (
              <OptionButton
                active={volumeWindow === VOLUME_WINDOW.WEEKLY}
                onClick={() => setVolumeWindow(VOLUME_WINDOW.WEEKLY)}
                isButtonGroup
              >
                Weekly
              </OptionButton>
            )}
            <OptionButton
              style={{ marginRight: '0px', marginLeft: '20px' }}
              active={localWindow === timeframeOptions.WEEK}
              onClick={() => setLocalWindow(timeframeOptions.WEEK)}
              isButtonGroup
            >
              1 Week
            </OptionButton>
            <OptionButton
              active={localWindow === timeframeOptions.ALL_TIME}
              onClick={() => setLocalWindow(timeframeOptions.ALL_TIME)}
              isButtonGroup
            >
              All Time
            </OptionButton>
          </Row>
        </RowBetween>
      )}

      {chartData && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={below1080 ? 60 / 28 : 60 / 28}>
          <AreaChart margin={{ top: 20, right: 0, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id="Gradient" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0%" stopColor="rgba(17, 179, 130, 0.05)" />
                <stop offset="100%" stopColor="rgba(17, 179, 130, 0.5)" />
              </linearGradient>
            </defs>
            <Area
              key={'other'}
              dataKey={'totalLiquidityUSD'}
              stackId="2"
              strokeWidth={1}
              stroke={'#11B382'}
              dot={false}
              type="monotone"
              name={'Liquidity'}
              yAxisId={0}
              opacity={'0.7'}
              isAnimationActive={true}
              fill="url(#Gradient)"
            />
            <XAxis
              tickLine={true}
              axisLine={true}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={50}
              tickFormatter={tick => toNiceDate(tick)}
              dataKey="date"
              // mirror={true}
              tick={{ fill: '#BDBDBD' }}
              padding={{ right: 0, bottom: 0 }}
              type={'number'}
              domain={domain}
              stroke="#EAEEEE"
            />
            <YAxis
              type="number"
              orientation="left"
              tickFormatter={tick => '$' + toK(tick)}
              axisLine={true}
              tickLine={true}
              interval="preserveEnd"
              minTickGap={50}
              yAxisId={0}
              // mirror={true}
              padding={{ top: 0, bottom: 15 }}
              tick={{ fill: '#BDBDBD' }}
              hide={below600}
              contentStyle={{
                zIndex: '100'
              }}
              stroke="none"
            />
            <CartesianGrid stroke="#EAEEEE" vertical={false} />
            <Tooltip
              cursor={{ stroke: 'rgb(157, 191, 183)', strokeWidth: 1 }}
              formatter={val => '$' + toK(val, true)}
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
          </AreaChart>
        </ResponsiveContainer>
      )}
      {chartData && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <BarChart
            margin={{ top: 20, right: 0, bottom: 6, left: 0 }}
            data={volumeWindow === VOLUME_WINDOW.DAYS ? chartDataFiltered : weeklyData}
            barCategoryGap={0}
          >
            <XAxis
              tickLine={false}
              axisLine={true}
              interval="preserveStartEnd"
              tickMargin={14}
              tickFormatter={tick =>
                volumeWindow === VOLUME_WINDOW.WEEKLY ? toWeeklyDate(tick - 1) : toNiceDate(tick)
              }
              dataKey="date"
              tick={{ fill: '#BDBDBD' }}
              padding={{ right: 0, bottom: 0 }}
              allowDataOverflow={true}
              minTickGap={80}
              stroke="#EAEEEE"
            />

            <YAxis
              axisLine={true}
              tickFormatter={tick => '$' + toK(tick, true, true)}
              tickLine={true}
              interval="preserveEnd"
              minTickGap={20}
              padding={{ top: 0, bottom: 0, left: 20 }}
              yAxisId={0}
              tick={{ fill: '#BDBDBD' }}
              domain={[0, 'dataMax']}
              orientation={'left'}
              stroke="none"
            />
            <CartesianGrid stroke="#EAEEEE" vertical={false} />
            <Tooltip
              cursor={{ fill: '#11B382', opacity: 0.1 }}
              formatter={val => '$' + toK(val, true)}
              labelFormatter={label =>
                volumeWindow === VOLUME_WINDOW.WEEKLY ? toWeeklyDate(label - 1) : toNiceDateYear(label)
              }
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
            <Bar
              type="monotone"
              name={'Volume'}
              dataKey={volumeWindow === VOLUME_WINDOW.DAYS ? 'dailyVolumeUSD' : 'weeklyVolumeUSD'}
              fill="#11B382"
              opacity={'1'}
              yAxisId={0}
              strokeWidth={2}
              stroke={'#fff'}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}

export default GlobalChart
