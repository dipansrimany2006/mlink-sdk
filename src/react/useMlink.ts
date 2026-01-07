'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ActionMetadata } from '../types';
import type { MlinkInstance, MlinkStatus, UseMlinkOptions } from './types';
import { parseBlinkUrl } from '../utils';
import { validateActionMetadata } from '../validators';

const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useMlink(
  url: string,
  options: UseMlinkOptions = {}
): MlinkInstance {
  const { refreshInterval = DEFAULT_REFRESH_INTERVAL, enabled = true } =
    options;

  const [status, setStatus] = useState<MlinkStatus>('idle');
  const [metadata, setMetadata] = useState<ActionMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Extract action URL from mlink URL if needed
  const actionUrl = parseBlinkUrl(url) || url;

  const fetchMetadata = useCallback(async () => {
    if (!actionUrl || !enabled) return;

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(actionUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response
      const validation = validateActionMetadata(data);
      if (!validation.success) {
        throw new Error(`Invalid metadata: ${validation.error}`);
      }

      setMetadata(validation.data);
      setStatus('ready');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch mlink data';
      setError(errorMessage);
      setStatus('error');
    }
  }, [actionUrl, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchMetadata();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMetadata, enabled]);

  // Set up refresh interval
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    intervalRef.current = setInterval(() => {
      fetchMetadata();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMetadata, refreshInterval, enabled]);

  return {
    status,
    metadata,
    error,
    url: actionUrl,
    refresh: fetchMetadata,
  };
}
