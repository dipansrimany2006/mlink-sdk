import {
  BLINK_BASE_URL,
  ACTION_QUERY_PARAM,
  SUPPORTED_CHAINS,
} from './constants';
import type { ChainConfig } from './types';

// Create Blink URL from Action URL
export function createBlinkUrl(
  actionUrl: string,
  baseUrl: string = BLINK_BASE_URL
): string {
  // Validate actionUrl is a valid URL
  try {
    new URL(actionUrl);
  } catch {
    throw new Error('Invalid action URL');
  }

  const encodedAction = encodeURIComponent(actionUrl);
  return `${baseUrl}/blink?${ACTION_QUERY_PARAM}=${encodedAction}`;
}

// Parse Blink URL to extract Action URL
export function parseBlinkUrl(blinkUrl: string): string | null {
  try {
    const url = new URL(blinkUrl);
    const actionParam = url.searchParams.get(ACTION_QUERY_PARAM);

    if (!actionParam) return null;

    const actionUrl = decodeURIComponent(actionParam);

    // Validate it's a valid URL
    new URL(actionUrl);

    return actionUrl;
  } catch {
    return null;
  }
}

// Check if URL is a valid Blink URL
export function isBlinkUrl(url: string): boolean {
  return parseBlinkUrl(url) !== null;
}

// Convert human readable amount to wei string
export function parseEther(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value) || value < 0) {
    throw new Error('Invalid amount');
  }
  const wei = BigInt(Math.floor(value * 1e18));
  return wei.toString();
}

// Convert wei to human readable amount
export function formatEther(wei: string | bigint): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei;
  const ether = Number(value) / 1e18;
  return ether.toFixed(6).replace(/\.?0+$/, '');
}

// Shorten address for display
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get explorer URL for transaction
export function getExplorerUrl(chainId: number, txHash: string): string {
  const chain = getChainById(chainId);
  if (!chain) return '';
  return `${chain.explorerUrl}/tx/${txHash}`;
}

// Get chain config by ID
export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.chainId === chainId);
}

// Get explorer URL for address
export function getAddressExplorerUrl(
  chainId: number,
  address: string
): string {
  const chain = getChainById(chainId);
  if (!chain) return '';
  return `${chain.explorerUrl}/address/${address}`;
}
