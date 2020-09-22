import React from 'react'

const Attribution = () => (
  <p className="attribution">
    <a href={process.env.REACT_APP_CODE_LINK} rel="noopener noreferrer" target="_blank">
      Github
    </a>{' '}
    |{' '}
    <a href={process.env.REACT_APP_INTERFACE_URL} rel="noopener noreferrer" target="_blank">
      Eniswap
    </a>{' '}
    |{' '}
  </p>
)

export default Attribution
