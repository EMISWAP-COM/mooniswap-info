import React from 'react'
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components'
import { useDarkModeManager } from '../contexts/LocalStorage'
import styled from 'styled-components/macro'
import { Text } from 'rebass'

export default function ThemeProvider({ children }) {
  const [darkMode] = useDarkModeManager()

  return <StyledComponentsThemeProvider theme={theme(darkMode)}>{children}</StyledComponentsThemeProvider>
}

const theme = (darkMode, color) => {

  color = '#37FFDB';

  return {
    customColor: color,
    textColor: darkMode ? color : '#24272C',

    panelColor: darkMode ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0)',
    backgroundColor: darkMode ? '#212429' : '#F7F8FA',

    emiswapPink: darkMode ? '#ff007a' : 'black',

    concreteGray: darkMode ? '#292C2F' : '#FAFAFA',
    inputBackground: darkMode ? '#1F1F1F' : '#FAFAFA',
    shadowColor: darkMode ? '#000' : '#3B403F',
    mercuryGray: darkMode ? '#333333' : '#E1E1E1',

    text1: darkMode ? '#FFFFFF' : '#24272C',
    text2: darkMode ? '#89919a' : '#565A69',
    text3: darkMode ? '#B7B7CA' : '#888D9B',
    text4: darkMode ? '#565A69' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',

// backgrounds / greys
    bg1: darkMode ? '#27272E' : '#FFFFFF',
    bg2: darkMode ? '#2C2F36' : '#F7F8FA',
    bg3: darkMode ? '#40444F' : '#EDEEF2',
    bg4: darkMode ? '#565A69' : '#CED0D9',
    bg5: darkMode ? '#565A69' : '#888D9B',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.4)',

    //primary colors
    primary1: darkMode ? '#7A2DF4' : '#FFD541',
    primary2: darkMode ? '#3680E7' : '#3680E7',
    primary3: darkMode ? '#4D8FEA' : '#4D8FEA',
    primary4: darkMode ? '#376bad70' : '#376bad70',
    primary5: darkMode ? '#153d6f70' : '#e7e7e7',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#474747',

    // secondary colors
    secondary1: darkMode ? '#2172E5' : '#ff007a',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    btn1: '#393946',
    focus: '#4A4757',
    active: '#7A2DF4',

    border1: darkMode ? '#4A4757' : 'transparent',
    border2: '#615C69',

    shadow1: darkMode ? '#000' : '#3B403F',

    // other
    red1: '#E85E59',
    red2: '#E85E59',
    green1: '#37FFDB',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    horse: darkMode ? '#ffffff' : '#FFD541',
    link: darkMode ? '#37FFDB' : '#11B382',

    background: darkMode ? 'black' : `radial-gradient(50% 50% at 50% 50%, #376bad15 0%, #376bad00 100%)`,

    purple: '#7A2DF4',
    purpleBoxShadow: '0px 4px 8px rgba(169, 115, 255, 0.32)',
    darkWhite: '#E8E7EF',
    darkText: '#B7B7CA',
    darkGrey: '#393946',
    lightGrey: '#615C69',
    red: '#E85E59',
    green: '#54B489',
    pink: '#E478FF',
    blue: '#37FFDB',
    border1Transparency: 'rgba(74, 71, 87, 0.32)',
    dark1: '#272530',
    dark2: '#0F0F13',
    dark1BoxShadow: '0px 0px 10px rgba(169, 115, 255, 0.32)',
    modalBoxShadow: '0px 0px 8px 4px #7a2df4',
    green5: 'rgb(17, 179, 130)',
  }
};

const TextWrapper = styled(Text)`
  color: ${({ color, theme }) => theme[color]};
`

export const TYPE = {
  main(props) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },

  header(props) {
    return <TextWrapper fontWeight={600} color={'text1'} {...props} />
  },

  light(props) {
    return <TextWrapper fontWeight={400} color={'text3'} fontSize={14} {...props} />
  },

  pink(props) {
    return <TextWrapper fontWeight={props.faded ? 400 : 600} color={props.faded ? 'text1' : 'text1'} {...props} />
  }
}

export const Hover = styled.div`
  :hover {
    cursor: pointer;
  }
`

export const Link = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
  :hover {
    text-decoration: underline;
  }
  :focus {
    outline: none;
    text-decoration: underline;
  }
  :active {
    text-decoration: none;
  }
`

export const ThemedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  max-width: 100vw !important;
  width: 100vw !important;
  height: 200vh;

  position: absolute;
  top: 0px;
  left: 0px;
  z-index: -1;

  transform: translateY(-110vh);
`

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');
  html { font-family: 'IBM Plex Sans', sans-serif; }
  @supports (font-variation-settings: normal) {
    html { font-family: 'IBM Plex Sans', sans-serif; }
  }
  
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    font-size: 14px;
    background: #26252C;
  }

  a {
    text-decoration: none;

    :hover {
      text-decoration: none
    }
  }

  html {
    font-size: 1rem;
    font-variant: none;
    color: ${({ theme }) => theme.text1};
    background-color: rgb(251, 251, 251);  
  }
`
