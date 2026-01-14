'use client';

import { useState, useCallback } from 'react';
import type {
  MlinkAdapter,
  MlinkStatus,
  ExecutionResult,
  UseExecuteMlinkReturn,
} from './types';
import type { TransactionResponse, EVMTransaction } from '../types';
import { validateTransactionResponse } from '../validators';

interface UseExecuteMlinkOptions {
  adapter: MlinkAdapter;
  actionUrl: string;
  onSuccess?: (txHash: string, action: string) => void;
  onError?: (error: string) => void;
}

/**
 * Enhanced UseExecuteMlinkReturn with data parameter support
 */
export interface UseExecuteMlinkReturnEnhanced extends Omit<UseExecuteMlinkReturn, 'execute'> {
  execute: (
    action: string,
    input?: string,
    data?: Record<string, string | string[]>
  ) => Promise<ExecutionResult>;
}

export function useExecuteMlink(
  options: UseExecuteMlinkOptions
): UseExecuteMlinkReturnEnhanced {
  const { adapter, actionUrl, onSuccess, onError } = options;

  const [status, setStatus] = useState<MlinkStatus>('ready');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('ready');
    setTxHash(null);
    setError(null);
  }, []);

  const execute = useCallback(
    async (
      action: string,
      input?: string,
      data?: Record<string, string | string[]>
    ): Promise<ExecutionResult> => {
      setStatus('executing');
      setError(null);
      setTxHash(null);

      try {
        // Ensure wallet is connected
        let account = adapter.getAddress();
        if (!adapter.isConnected() || !account) {
          account = await adapter.connect();
        }

        // Make POST request to get transaction
        const response = await fetch(actionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account,
            action,
            input,
            data, // Include parameter data
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const responseData: TransactionResponse = await response.json();

        // Get transactions (support both single and multiple)
        const transactions: EVMTransaction[] = responseData.transactions
          ? responseData.transactions
          : responseData.transaction
          ? [responseData.transaction]
          : [];

        if (transactions.length === 0) {
          throw new Error('No transaction returned from action');
        }

        // Execute all transactions sequentially
        let lastHash = '';
        for (const tx of transactions) {
          lastHash = await adapter.signAndSendTransaction(tx);
        }

        setTxHash(lastHash);
        setStatus('success');
        onSuccess?.(lastHash, action);

        return {
          success: true,
          txHash: lastHash,
          message: responseData.message,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Transaction failed';
        setError(errorMessage);
        setStatus('error');
        onError?.(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [adapter, actionUrl, onSuccess, onError]
  );

  return {
    execute,
    status,
    txHash,
    error,
    reset,
  };
}
