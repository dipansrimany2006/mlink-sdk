import type { ActionMetadata, EVMTransaction, ChainConfig } from '../types';

// Mlink state status
export type MlinkStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'executing'
  | 'success'
  | 'error';

// Mlink instance returned by useMlink
export interface MlinkInstance {
  status: MlinkStatus;
  metadata: ActionMetadata | null;
  error: string | null;
  url: string;
  refresh: () => Promise<void>;
}

// Adapter for wallet interactions
export interface MlinkAdapter {
  connect: () => Promise<string>;
  signAndSendTransaction: (transaction: EVMTransaction) => Promise<string>;
  isConnected: () => boolean;
  getAddress: () => string | null;
}

// Wagmi adapter config
export interface WagmiAdapterConfig {
  sendTransaction: (args: {
    to: `0x${string}`;
    value: bigint;
    data: `0x${string}`;
    chainId: number;
  }) => Promise<`0x${string}`>;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  connect: () => Promise<void>;
}

// Ethers adapter config
export interface EthersAdapterConfig {
  signer: {
    getAddress: () => Promise<string>;
    sendTransaction: (tx: {
      to: string;
      value: bigint;
      data: string;
      chainId: number;
    }) => Promise<{ hash: string; wait: () => Promise<unknown> }>;
  } | null;
  connect: () => Promise<void>;
}

// Theme configuration
export interface MlinkTheme {
  // Colors
  '--mlink-bg-primary': string;
  '--mlink-bg-secondary': string;
  '--mlink-border-color': string;
  '--mlink-text-primary': string;
  '--mlink-text-secondary': string;
  '--mlink-text-link': string;
  '--mlink-button-bg': string;
  '--mlink-button-text': string;
  '--mlink-button-hover': string;
  '--mlink-button-disabled': string;
  '--mlink-input-bg': string;
  '--mlink-input-border': string;
  '--mlink-input-text': string;
  '--mlink-input-placeholder': string;
  '--mlink-success': string;
  '--mlink-error': string;
  '--mlink-warning': string;
  // Sizing
  '--mlink-border-radius': string;
  '--mlink-button-radius': string;
  '--mlink-input-radius': string;
  // Shadows
  '--mlink-shadow': string;
}

// Preset themes
export type MlinkThemePreset = 'light' | 'dark' | 'mantle';

// Provider configuration
export interface MlinkProviderConfig {
  theme?: Partial<MlinkTheme> | MlinkThemePreset;
  defaultChain?: ChainConfig;
}

// Mlink component props
export interface MlinkProps {
  url: string;
  adapter: MlinkAdapter;
  theme?: Partial<MlinkTheme> | MlinkThemePreset;
  onSuccess?: (txHash: string, action: string) => void;
  onError?: (error: string) => void;
  className?: string;
  stylePreset?: 'default' | 'compact' | 'minimal';
}

// Action button component props
export interface ActionButtonProps {
  label: string;
  value: string;
  type: 'button' | 'input';
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: (value: string, input?: string) => void;
}

// Execution result
export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  message?: string;
}

// useMlink hook options
export interface UseMlinkOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

// Hook return type for useExecuteMlink
export interface UseExecuteMlinkReturn {
  execute: (action: string, input?: string) => Promise<ExecutionResult>;
  status: MlinkStatus;
  txHash: string | null;
  error: string | null;
  reset: () => void;
}
