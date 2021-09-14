import EthereumNetworkIcon from '../assets/ethereum-network.svg';
import KuCoinNetworkIcon from '../assets/kucoin-network.svg';

export const networksItems = [
  {
    network: 'main',
    alias: 'MAINNET',
    factoryAddress: '0x1771dff85160768255F0a44D20965665806cBf48',
    clientTheGraph: 'https://api.thegraph.com/subgraphs/name/lombardi22/emiswap8',
    blockClientTheGraph: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    name: 'Ethereum',
    icon: EthereumNetworkIcon,
    scanUrl: 'etherscan.io',
    scanName: 'Etherscan',
    priceText: 'Emiswap ETH price',
    rpcUrls: [''],
    currencySymbol: 'ETH',
    blockExplorerUrls: '',
  },
  {
    network: 'kcc',
    alias: 'KUCOIN',
    factoryAddress: '0x945316F2964ef5C6C84921b435a528DD1790E93a',
    clientTheGraph: 'https://thegraph.kcc.network/subgraphs/name/emiswap/emiswap1',
    blockClientTheGraph: 'https://thegraph.kcc.network/subgraphs/name/kcc-blocks',
    name: 'KuCoin',
    icon: KuCoinNetworkIcon,
    scanUrl: 'explorer.kcc.io',
    scanName: 'Explorer',
    priceText: 'KCS Price',
    rpcUrls: ['https://rpc-mainnet.kcc.network'],
    currencySymbol: 'KCS',
    blockExplorerUrls: 'https://explorer.kcc.io/en',
  },
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
