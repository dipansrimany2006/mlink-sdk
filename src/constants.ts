import type { ChainConfig } from './types';

export const MANTLE_MAINNET: ChainConfig = {
  chainId: 5000,
  name: 'Mantle',
  rpcUrl: 'https://rpc.mantle.xyz',
  explorerUrl: 'https://mantlescan.xyz',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
};

export const MANTLE_SEPOLIA: ChainConfig = {
  chainId: 5003,
  name: 'Mantle Sepolia',
  rpcUrl: 'https://rpc.sepolia.mantle.xyz',
  explorerUrl: 'https://sepolia.mantlescan.xyz',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
};

export const SUPPORTED_CHAINS: ChainConfig[] = [MANTLE_MAINNET, MANTLE_SEPOLIA];

export const DEFAULT_CHAIN = MANTLE_SEPOLIA;

export const MLINK_BASE_URL = 'https://www.m-links.xyz';

export const ACTION_QUERY_PARAM = 'action';

// Registry URL for validation
export const REGISTRY_URL = 'https://mlink-client.vercel.app';
export const REGISTRY_VALIDATE_ENDPOINT = '/api/registry/validate';
