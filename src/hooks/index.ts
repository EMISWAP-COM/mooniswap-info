import {useCallback, useEffect, useRef, useState} from 'react'
import {getIsValidNumber} from '../helpers'
import copy from 'copy-to-clipboard'
import {PAGES} from '../constants'
import {getNetworkData} from "../helpers/network";
import dayjs, {OpUnitType} from "dayjs";

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
  return getNetworkData();
};

export const useIsMainNetwork = () => {
  const {alias} = useNetworkData();

  return alias === 'MAINNET';
};

export const useIsKuCoinNetwork = () => {
  const {alias} = useNetworkData();

  return alias === 'KUCOIN';
};

export const useIsPolygonNetwork = () => {
  const {alias} = useNetworkData();

  return alias === 'POLYGON';
};

export const useIsAvalancheNetwork = () => {
  const {alias} = useNetworkData();

  return alias === 'AVALANCHE';
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
  // const {alias} = useNetworkData();

  const isKuCoinNetwork = useIsKuCoinNetwork();
  const isPolygonNetwork = useIsPolygonNetwork();
  const isAvalancheNetwork = useIsAvalancheNetwork()

  if (!address) {
    return ['https://etherscan.io/images/main/empty-token.png']
  }

  if (isKuCoinNetwork) {
    return [
      `https://raw.githubusercontent.com/KoffeeSwap/kcc-assets/main/mainnet/tokens/${address}/logo.png`,
      `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`,
    ]
  }

  if (isPolygonNetwork) {
    return [
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/${address}/logo.png`,
      `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`,
    ]
  }

  if (isAvalancheNetwork) {
    return [
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/${address}/logo.png`,
      `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`,
    ]
  }

  return [
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    `https://1inch.exchange/assets/tokens/${address.toLowerCase()}.png`,
  ]
}


export function useAllTimeDate(value: number = 1, unit: OpUnitType = 'year') {
  const isPolygonNetwork = useIsPolygonNetwork();

  const utcEndTime = dayjs.utc();
  let utcStartTime = utcEndTime.subtract(value, unit);

  if (isPolygonNetwork) {
    utcStartTime = dayjs.utc(new Date('10-15-2021'));
  }

  return utcStartTime;
}
