import EthereumNetworkIcon from '../assets/ethereum-network.svg';
import KuCoinNetworkIcon from '../assets/kucoin-network.svg';
import PolygonNetworkIcon from '../assets/polygon-network.svg';
import AvalancheNetworkIcon from '../assets/avalanche-network.svg';

export const networksItems = [
  {
    network: 'main',
    alias: 'MAINNET',
    factoryAddress: '0x1771dff85160768255F0a44D20965665806cBf48',
    clientTheGraph: 'https://api.thegraph.com/subgraphs/name/lombardi22/emiswap8',
    blockClientTheGraph: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    name: 'Ethereum',
    name2: 'Ethereum',
    icon: EthereumNetworkIcon,
    scanUrl: 'etherscan.io',
    scanName: 'Etherscan',
    priceText: 'Emiswap ETH price',
    rpcUrls: [''],
    currencySymbol: 'ETH',
    tokenTextName: 'ERC-20',
  },
  {
    network: 'kcc',
    alias: 'KUCOIN',
    factoryAddress: '0x945316F2964ef5C6C84921b435a528DD1790E93a',
    clientTheGraph: 'https://thegraph.kcc.network/subgraphs/name/emiswap/emiswap1',
    blockClientTheGraph: 'https://thegraph.kcc.network/subgraphs/name/kcc-blocks',
    name: 'KuCoin',
    name2: 'KCC',
    icon: KuCoinNetworkIcon,
    scanUrl: 'explorer.kcc.io',
    scanName: 'Explorer',
    priceText: 'KCS Price',
    rpcUrls: ['https://rpc-mainnet.kcc.network'],
    currencySymbol: 'KCS',
    tokenTextName: 'KRC-20',
  },
  {
    network: 'polygon',
    alias: 'POLYGON',
    factoryAddress: '0x23c1b313152e276e0CF61665dc3AC160b3c5aB19',
    clientTheGraph: 'https://api.thegraph.com/subgraphs/name/lombardi22/polygon',
    blockClientTheGraph: 'https://api.thegraph.com/subgraphs/name/matthewlilley/polygon-blocks',
    name: 'Polygon',
    name2: 'Polygon',
    icon: PolygonNetworkIcon,
    scanUrl: 'polygonscan.com',
    scanName: 'Polygonscan',
    priceText: 'MATIC Price',
    rpcUrls: ['https://rpc-mumbai.matic.today',],
    currencySymbol: 'MATIC',
    tokenTextName: 'MRC-20',
  },
  /*{
    network: 'avalanche',
    alias: 'AVALANCHE',
    factoryAddress: '0x7B4b70c61a8fDE4E8c03f99adC567C1762d9d247',
    clientTheGraph: 'https://api.thegraph.com/subgraphs/name/lombardi22/avalanche',
    blockClientTheGraph: 'https://api.thegraph.com/subgraphs/name/dasconnor/avalanche-blocks',
    name: 'Avalanche',
    name2: 'Avalanche',
    icon: AvalancheNetworkIcon,
    scanUrl: 'explorer.avax.network',
    scanName: 'Avax Explorer',
    priceText: 'AVAX Price',
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc',],
    currencySymbol: 'AVAX',
    tokenTextName: 'ARC-20',
  },*/
];

export function getNetworkData() {
  const searchParams = new URLSearchParams(window.location.search);
  let network = searchParams.get('network');

  if (network) {
    localStorage.setItem('network', network);
  } else {
    network = localStorage.getItem('network');
  }

  return networksItems.find(item => item.network === network) || networksItems[0];
}
