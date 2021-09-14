import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

import { PAGES } from '../../constants'

const PaginationWrapper = styled.div`
  background-color: transparent;
  display: flex;
  align-items: center;
  font-weight: 700;
  margin-bottom: 20px;
  padding: 20px 40px;
  max-width: 100%;
  
  @media screen and (max-width: 680px) {
    padding: 0;
  }
`

const PaginationButton = styled.button`
  background-color: ${({ theme, active }) => (active ? theme.active : 'transparent')};
  color: ${({ theme, active }) => (active ? '#fff' : theme.text1)};
  border: none;
  cursor: pointer;
  outline: none;
  padding: 6px 11px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.02em;
`

const PaginationArrow = styled.button`
  color: ${({ theme }) => theme.text1};
  opacity: ${props => (props.disabled ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  border: none;
  background: transparent;

  :hover {
    cursor: pointer;
  }

  :first-child,
  :last-child {
    padding: 0 10px;
  }
  
  @media screen and (max-width: 680px) {
    padding: 0 10px;
  }
`

const PaginationDots = styled.span`
  padding: 6px 11px;
`

const renderPaginationBtns = (onClick, page, lastPage) => {
  const startBtns = [page, page + 1]
  const gapBtns = [page - 1, page]
  const middleBtn = ['...']
  const lastBtns = [lastPage - 1, lastPage]

  let btnsArr = []

  if (page < lastPage - 3) {
    btnsArr = [...startBtns, ...middleBtn, ...lastBtns]
  } else if (lastPage <= 4) {
    btnsArr = [...Array(lastPage).keys()].map(page => ++page)
  } else if (page < lastPage - 2) {
    btnsArr = [...gapBtns, ...middleBtn, ...lastBtns]
  } else if (page < lastPage - 1) {
    btnsArr = [...gapBtns, ...lastBtns] // last 4 pages
  } else if (page === 0 && lastPage === 0) {
    btnsArr = []
  } else {
    btnsArr = [...middleBtn, ...lastBtns] // last 2 pages
  }

  return btnsArr.map(num => (
    <Fragment key={num}>
      {num === '...' ? (
        <PaginationDots>{num}</PaginationDots>
      ) : (
        <PaginationButton data-name={num} onClick={onClick} active={num === page}>
          {num}
        </PaginationButton>
      )}
    </Fragment>
  ))
}

const Pagination = ({ onClick, page, lastPage }) => {
  const isFirstPage = page === 1
  const isLastPage = page === lastPage

  return (
    <PaginationWrapper>
      <PaginationArrow data-name={PAGES.FIRST} onClick={onClick} disabled={isFirstPage}>
        {'<<'}
      </PaginationArrow>
      <PaginationArrow data-name={PAGES.PREV} onClick={onClick} disabled={isFirstPage}>
        {'<'}
      </PaginationArrow>
      {renderPaginationBtns(onClick, page, lastPage)}
      <PaginationArrow data-name={PAGES.NEXT} onClick={onClick} disabled={isLastPage}>
        {'>'}
      </PaginationArrow>
      <PaginationArrow data-name={PAGES.LAST} onClick={onClick} disabled={isLastPage}>
        {'>>'}
      </PaginationArrow>
    </PaginationWrapper>
  )
}

Pagination.propTypes = {
  onClick: PropTypes.func,
  page: PropTypes.number,
  lastPage: PropTypes.number
}

Pagination.defaultProps = {
  onClick: () => {},
  page: 0,
  lastPage: 0
}

export default Pagination
