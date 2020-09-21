import { useState, useCallback, useEffect, useRef } from 'react'
import { shade } from 'polished'
import Vibrant from 'node-vibrant'
import { hex } from 'wcag-contrast'
import { getIsValidNumber, getLogoUrlList, isAddress } from '../helpers'
import copy from 'copy-to-clipboard'
import { PAGES } from '../constants'

export function useColor(tokenAddress, token) {
  const [color, setColor] = useState('#11B382')
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
  return color
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