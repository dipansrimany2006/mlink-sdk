'use client';

import { useState, useCallback } from 'react';
import type {
  MlinkAdapter,
  MlinkStatus,
  ExecutionResult,
  UseExecuteMlinkReturn,
} from './types';
import type { TransactionResponse } from '../types';
import { validateTransactionResponse } from '../validators';

interface UseExecuteMlinkOptions {
  adapter: MlinkAdapter;
  actionUrl: string;
  onSuccess?: (txHash: string, action: string) => void;
  onError?: (error: string) => void;
}

export function useExecuteMlink(
  options: UseExecuteMlinkOptions
): UseExecuteMlinkReturn {
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
    async (action: string, input?: string): Promise<ExecutionResult> => {
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
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: TransactionResponse = await response.json();

        // Validate response
        const validation = validateTransactionResponse(data);
        if (!validation.success) {
          throw new Error(`Invalid response: ${validation.error}`);
        }

        // Sign and send transaction
        const hash = await adapter.signAndSendTransaction(data.transaction);

        setTxHash(hash);
        setStatus('success');
        onSuccess?.(hash, action);

        return {
          success: true,
          txHash: hash,
          message: data.message,
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
