import React from 'react'
import { Link as RebassLink } from 'rebass'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'
import { lighten, darken } from 'polished'

const WrappedLink = ({ external, children, ...rest }) => (
  <RebassLink
    target={external ? '_blank' : null}
    rel={external ? 'noopener noreferrer' : null}
    color="#3B403F"
    {...rest}
  >
    {children}
  </RebassLink>
)

WrappedLink.propTypes = {
  external: PropTypes.bool
}

const Link = styled(WrappedLink)`
  color: ${({ color, theme }) => (theme.link)};
`

export default Link

export const CustomLink = styled(RouterLink)`
  text-decoration: none;
  font-weight: 500;
  color: ${({ color, theme }) => (theme.text1)};

  &:visited {
    color: ${({ color, theme }) => (lighten(0.1, theme.text1))};
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
    color: ${({ color, theme }) => (darken(0.1, theme.text1))};
  }
`

export const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: inherit;
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
`
