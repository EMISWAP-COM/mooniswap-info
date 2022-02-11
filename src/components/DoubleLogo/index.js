import React from 'react'
import styled from 'styled-components/macro'
import TokenLogo from '../TokenLogo'

export default function DoubleTokenLogo({a0, s0, a1, s1, size = 24, margin = false}) {
  const TokenWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: ${({sizeraw, margin}) => margin && (sizeraw / 3 + 8).toString() + 'px'};
  `

  const HigherLogo = styled(TokenLogo)`
    z-index: 2;
  `

  const CoveredLogo = styled(TokenLogo)`
    position: absolute;
    left: ${({sizeraw}) => (sizeraw / 2).toString() + 'px'};
  `

  return (
    <TokenWrapper sizeraw={size} margin={margin}>
      <HigherLogo address={a0} symbol={s0} size={size.toString() + 'px'} sizeraw={size}/>
      <CoveredLogo address={a1} symbol={s1} size={size.toString() + 'px'} sizeraw={size}/>
    </TokenWrapper>
  )
}
