import {useCallback, useEffect, useRef, useState} from 'react'
import {getIsValidNumber} from '../helpers'
import copy from 'copy-to-clipboard'
import {PAGES} from '../constants'

export function useColor(tokenAddress, token) {
  return '#37FFDB';

  /*const [color, setColor] = useState('#37FFDB')
  if (tokenAddress) {
    const pathList = getLogoUrlList(isAddress(
      tokenAddress
    ))
    if (pathList?.length > 0) {
      Vibrant.from(pathList[0]).getPalette((err, palette) => {
        if (palette && palette.Vibrant) {
          let detectedHex = palette.Vibrant.hex
          let AAscore = hex(detectedHex, '#FFF')
          while (AAscore < 3) {
            detectedHex = shade(0.005, detectedHex)
            AAscore = hex(detectedHex, '#FFF')
          }
          if (token === 'DAI') {
            setColor('#FAAB14')
          } else {
            setColor(detectedHex)
          }
        }
      })
    }
  }
  return color*/
}

export function useCopyClipboard(timeout = 500) {
  const [isCopied, setIsCopied] = useState(false)

  const staticCopy = useCallback(text => {
    const didCopy = copy(text)
    setIsCopied(didCopy)
  }, [])

  useEffect(() => {
    if (isCopied) {
      const hide = setTimeout(() => {
        setIsCopied(false)
      }, timeout)

      return () => {
        clearTimeout(hide)
      }
    }
  }, [isCopied, setIsCopied, timeout])

  return [isCopied, staticCopy]
}

export const useOutsideClick = (ref, ref2, callback) => {
  const handleClick = e => {
    if (ref.current && ref.current && !ref2.current) {
      callback(true)
    } else if (ref.current && !ref.current.contains(e.target) && ref2.current && !ref2.current.contains(e.target)) {
      callback(true)
    } else {
      callback(false)
    }
  }
  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}

export default function useInterval(callback: () => void, delay: null | number) {
  const savedCallback = useRef<() => void>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      const current = savedCallback.current
      current && current()
    }

    if (delay !== null) {
      tick()
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return
  }, [delay])
}

export const usePagination = (initPage, maxPage) => {
  const [page, setPage] = useState(initPage);

  const handlePageChange = ({ target }) => {
    const btnType = target.getAttribute('data-name');

    getIsValidNumber(btnType) ? setPage(+btnType) : handleSpecificBtnType(btnType);
  };

  const handleSpecificBtnType = btnType => {
    switch (btnType) {
      case PAGES.PREV:
        setPage(page - 1);
        break;
      case PAGES.NEXT:
        setPage(page + 1);
        break;
      case PAGES.FIRST:
        setPage(1);
        break;
      case PAGES.LAST:
        setPage(maxPage);
        break;
      default:
        break;
    }
  };

  return [page, handlePageChange];
};

export const useNetworkData = () => {
  const data = {
    main: {
      networkName: 'MAINNET',
      factoryAddress: '0x1771dff85160768255F0a44D20965665806cBf48',
      clientTheGraph: 'https://api.thegraph.com/subgraphs/name/lombardi22/emiswap8',
      blockClientTheGraph: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
      scanUrl: 'etherscan.io',
      scanName: 'Etherscan',
      priceText: 'Emiswap ETH price',
    },
    kcc: {
      networkName: 'KUCOIN',
      factoryAddress: '0x945316F2964ef5C6C84921b435a528DD1790E93a',
      clientTheGraph: 'https://thegraph.kcc.network/subgraphs/name/emiswap/emiswap1',
      blockClientTheGraph: 'https://thegraph.kcc.network/subgraphs/name/kcc-blocks',
      scanUrl: 'explorer.kcc.io',
      scanName: 'Explorer',
      priceText: 'KCS Price',
    },
  };

  return data.kcc;
};

export const useIsKuCoinNetwork = () => {
  const {networkName} = useNetworkData();

  return networkName === 'KUCOIN';
};

export const useUrls = () => {
  const {scanUrl} = useNetworkData();

  return {
    showTransaction: tx => `https://${scanUrl}/tx/${tx}/`,
    showAddress: address => `https://${scanUrl}/address/${address}/`,
    showToken: address => `https://${scanUrl}/token/${address}/`,
    showBlock: block => `https://${scanUrl}/block/${block}/`
  }
}

export function useLogoUrlList(address) {
  // const {networkName} = useNetworkData();
  const isKuCoinNetwork = useIsKuCoinNetwork();

  if (!address) {
    return ['https://etherscan.io/images/main/empty-token.png']
  }

  if (isKuCoinNetwork) {
    return [
      `https://raw.githubusercontent.com/KoffeeSwap/kcc-assets/main/mainnet/tokens/${address}/logo.png`,
      `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`,
    ]
  }

  return [
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`,
  ]
}
