import React from 'react'
import styled, { css } from 'styled-components'

const Loader = styled.div`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  & > * {
    width: 72px;
  }

  ${props =>
  props.fill && !props.height
    ? css`
          height: 100vh;
          position: fixed;
          top: 0;
          z-index: 99999;
          background: #26252C;
        `
    : css`
          height: 180px;
        `}
`
const LocalLoader = ({ fill }) => {
  return (
    <Loader fill={fill}>
        <iframe
          style={{ width: '80%', maxWidth: '800px' }}
          src="analytics/preloader/preloader.html"
          height="100%"
          width="100%"
          frameBorder="0"
          title="preloader"
        />
    </Loader>
  )
}

export default LocalLoader
