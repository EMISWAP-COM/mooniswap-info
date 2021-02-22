import React from 'react'
import { Flex } from 'rebass'

import Link from '../Link'

const links = [
  { url: process.env.REACT_APP_INTERFACE_URL, text: 'Exchange' },
  { url: process.env.REACT_APP_CODE_LINK, text: 'Code' }
]

const FooterLink = ({ children, ...rest }) => (
  <Link external color="emiswappink" fontWeight={500} fontSize={12} mr={'8px'} {...rest}>
    {children}
  </Link>
)

const Footer = () => (
  <Flex as="footer" p={24}>
    {links.map((link, index) => (
      <FooterLink key={index} href={link.url}>
        {link.text}
      </FooterLink>
    ))}
  </Flex>
)

export default Footer
