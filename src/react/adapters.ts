'use client';

import { useMemo } from 'react';
import type {
  MlinkAdapter,
  WagmiAdapterConfig,
  EthersAdapterConfig,
} from './types';
import type { EVMTransaction } from '../types';

/**
 * Create a Mlink adapter from wagmi hooks
 *
 * @example
 * ```tsx
 * import { useAccount, useConnect, useSendTransaction } from 'wagmi';
 * import { useMlinkWagmiAdapter } from '@dipansrimany/mlink-sdk/react';
 *
 * function MyComponent() {
 *   const { address, isConnected } = useAccount();
 *   const { connectAsync, connectors } = useConnect();
 *   const { sendTransactionAsync } = useSendTransaction();
 *
 *   const adapter = useMlinkWagmiAdapter({
 *     address,
 *     isConnected,
 *     connect: async () => {
 *       await connectAsync({ connector: connectors[0] });
 *     },
 *     sendTransaction: sendTransactionAsync,
 *   });
 *
 *   return <Mlink url="..." adapter={adapter} />;
 * }
 * ```
 */
export function useMlinkWagmiAdapter(config: WagmiAdapterConfig): MlinkAdapter {
  const { address, isConnected, connect, sendTransaction } = config;

  return useMemo(
    () => ({
      connect: async () => {
        await connect();
        if (!address) {
          throw new Error('Failed to connect wallet');
        }
        return address;
      },

      signAndSendTransaction: async (transaction: EVMTransaction) => {
        const txHash = await sendTransaction({
          to: transaction.to as `0x${string}`,
          value: BigInt(transaction.value),
          data: transaction.data as `0x${string}`,
          chainId: transaction.chainId,
        });
        return txHash;
      },

      isConnected: () => isConnected,

      getAddress: () => address || null,
    }),
    [address, isConnected, connect, sendTransaction]
  );
}

/**
 * Create a Mlink adapter from ethers.js signer
 *
 * @example
 * ```tsx
 * import { useSigner } from 'some-ethers-provider';
 * import { useMlinkEthersAdapter } from '@dipansrimany/mlink-sdk/react';
 *
 * function MyComponent() {
 *   const { signer, connect } = useSigner();
 *
 *   const adapter = useMlinkEthersAdapter({
 *     signer,
 *     connect,
 *   });
 *
 *   return <Mlink url="..." adapter={adapter} />;
 * }
 * ```
 */
export function useMlinkEthersAdapter(
  config: EthersAdapterConfig
): MlinkAdapter {
  const { signer, connect } = config;

  return useMemo(
    () => ({
      connect: async () => {
        await connect();
        if (!signer) {
          throw new Error('Failed to connect wallet');
        }
        return await signer.getAddress();
      },

      signAndSendTransaction: async (transaction: EVMTransaction) => {
        if (!signer) {
          throw new Error('Wallet not connected');
        }

        const tx = await signer.sendTransaction({
          to: transaction.to,
          value: BigInt(transaction.value),
          data: transaction.data,
          chainId: transaction.chainId,
        });

        return tx.hash;
      },

      isConnected: () => signer !== null,

      getAddress: () => null, // Ethers requires async call
    }),
    [signer, connect]
  );
}

/**
 * Create a custom Mlink adapter
 *
 * @example
 * ```tsx
 * import { createMlinkAdapter } from '@dipansrimany/mlink-sdk/react';
 *
 * const adapter = createMlinkAdapter({
 *   connect: async () => {
 *     // Your connect logic
 *     return '0x...';
 *   },
 *   signAndSendTransaction: async (tx) => {
 *     // Your transaction logic
 *     return '0x...txHash';
 *   },
 *   isConnected: () => true,
 *   getAddress: () => '0x...',
 * });
 * ```
 */
export function createMlinkAdapter(adapter: MlinkAdapter): MlinkAdapter {
  return adapter;
}
