import EthereumNetworkIcon from '../assets/ethereum-network.svg';
import KuCoinNetworkIcon from '../assets/kucoin-network.svg';
import PolygonNetworkIcon from '../assets/polygon-network.svg';
import AuroraNetworkIcon from '../assets/aurora-network.svg';
import ShidenNetworkIcon from '../assets/shiden-network.png';
import GatechainNetworkIcon from '../assets/gatechain-network.svg';
// import AvalancheNetworkIcon from '../assets/avalanche-network.svg';

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
    rpcUrls: ['https://rpc-mumbai.matic.today'],
    currencySymbol: 'MATIC',
    tokenTextName: 'MRC-20',
  },
  {
    network: 'shiden',
    alias: 'SHIDEN',
    factoryAddress: '0x7449314B698f918E98c76279B5570613b243eECf',
    clientTheGraph: 'https://shiden-graph.emiswap.com/subgraphs/name/shiden',
    blockClientTheGraph: 'https://shiden-graph.emiswap.com/subgraphs/name/shiden-blocks',
    name: 'Shiden',
    name2: 'Shiden',
    icon: ShidenNetworkIcon,
    scanUrl: 'blockscout.com/shiden',
    scanName: 'Shiden Blockscout',
    priceText: 'SDN Price',
    rpcUrls: ['https://rpc.shiden.astar.network:8545',],
    currencySymbol: 'SDN',
    tokenTextName: 'SDN-20',
  },
  {
    network: 'aurora',
    alias: 'AURORA',
    factoryAddress: '0x979e5d41595263f6Dfec4F4D48419C555B80D95c',
    clientTheGraph: 'https://api.thegraph.com/subgraphs/name/lombardi22/aurora',
    blockClientTheGraph: 'https://api.thegraph.com/subgraphs/name/wannaswap/blocks',
    name: 'Aurora',
    name2: 'Aurora',
    icon: AuroraNetworkIcon,
    scanUrl: 'aurorascan.dev',
    scanName: 'Aurora Block Explorer',
    priceText: 'ETH Price',
    rpcUrls: ['https://rpc.mainnet.near.org'],
    currencySymbol: 'ETH',
    tokenTextName: 'ERC-20',
  },
  {
    network: 'gatechain',
    alias: 'GATECHAIN',
    factoryAddress: '0xb4BcA5955F26d2fA6B57842655d7aCf2380Ac854',
    clientTheGraph: 'https://10.165.101.51/subgraphs/name/gatechain',
    blockClientTheGraph: 'https://10.165.101.51/subgraphs/name/gatechain-blocks',
    name: 'GateChain',
    name2: 'GateChain',
    icon: GatechainNetworkIcon,
    scanUrl: 'https://gatescan.org',
    scanName: 'GateChain Block Explorer',
    priceText: 'GT Price',
    rpcUrls: ['https://evm.gatenode.cc'],
    currencySymbol: 'GT',
    tokenTextName: 'ERC-20',
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
