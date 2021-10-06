import React, {useEffect, useState} from 'react'
import styled from 'styled-components/macro'
import {isAddress} from '../../helpers'
import EmiswapLogo from '../../assets/esw_light.svg'
import EthereumLogo from '../../assets/eth.png'
import KuCoinLogo from '../../assets/kcs.png'
import BerezkaLogo from '../../assets/berezka.png'
import NoLogoCoin from '../../assets/no_logo_coin.svg'
import {ETH} from '../../helpers'
import {useLogoUrlList} from "../../hooks";

const BAD_IMAGES = {}
const FALLBACK_URIS = {}

const FLEX_ADDRESS = '0x0d7dea5922535087078dd3d7c554ea9f2655d4cb'
const BDQ_ADDRESS = '0xf6ce9bfa82d1088d3257a76ec2e0ce1c8060bf8c'

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 1rem;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`

const StyledLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`

export default function TokenLogo({ address, header = false, size = '18px', ...rest }) {
  const [error, setError] = useState(false)

  const urlList = useLogoUrlList(isAddress(address))

  useEffect(() => {
    setError(false)
  }, [address])

  if (error) {
    return (
      <Inline>
        <Image {...rest} alt={''} src={NoLogoCoin} size={size} />
      </Inline>
    )
  }

  if ([
    '0x5a75A093747b72a0e14056352751eDF03518031d'.toLowerCase(),
    '0x8933a6e58eeee063b5fd3221f2e1d17821dc1031'.toLowerCase(),
    '0xd2a2a353d28e4833faffc882f6649c9c884a7d8f'.toLowerCase(),
  ].includes(address?.toLowerCase())) {
    return (
      <Inline>
        <Image {...rest} alt={''} src={EmiswapLogo} size={size} />
      </Inline>
    )
  }

  if (address?.toLowerCase() === '0x4446fc4eb47f2f6586f9faab68b3498f86c07521') {
    return (
      <Inline>
        <Image {...rest} alt={''} src={KuCoinLogo} size={size}/>
      </Inline>
    )
  }

  // hard coded fixes for trust wallet api issues
  if (address?.toLowerCase() === '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb') {
    address = '0x42456d7084eacf4083f1140d3229471bba2949a8'
  }

  if (address?.toLowerCase() === '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f') {
    address = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
  }

  if (address?.toLowerCase() === ETH) {
    return (
      <StyledLogo size={size} {...rest}>
        <img
          src={EthereumLogo}
          style={{ boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)', borderRadius: '24px' }}
          alt=""
        />
      </StyledLogo>
    )
  }

  if (address === FLEX_ADDRESS || address === BDQ_ADDRESS) {
    return (
      <StyledLogo size={size} {...rest}>
        <img
          src={BerezkaLogo}
          style={{ boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)', borderRadius: '24px' }}
          alt=""
        />
      </StyledLogo>
    )
  }

  let uri
  if (!uri) {
    const defaultUri = urlList[0]
    if (!BAD_IMAGES[defaultUri]) {
      uri = defaultUri
    }
    if (FALLBACK_URIS[address]) {
      uri = FALLBACK_URIS[address]
    }
  }

  return (
    <Inline>
      <Image
        {...rest}
        alt={''}
        src={uri}
        size={size}
        onError={event => {
          if (FALLBACK_URIS[address]) {
            BAD_IMAGES[address] = true
            setError(true)
            event.preventDefault()
          } else {
            FALLBACK_URIS[address] = urlList[1]
            setError(true)
          }
        }}
      />
    </Inline>
  )
}
