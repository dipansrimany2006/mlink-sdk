'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { MlinkProviderConfig, MlinkTheme } from './types';
import type { ChainConfig } from '../types';
import { resolveTheme } from './themes';
import { DEFAULT_CHAIN } from '../constants';

interface MlinkContextValue {
  theme: MlinkTheme;
  defaultChain: ChainConfig;
}

const MlinkContext = createContext<MlinkContextValue | null>(null);

export interface MlinkProviderProps extends MlinkProviderConfig {
  children: React.ReactNode;
}

export function MlinkProvider({
  children,
  theme,
  defaultChain = DEFAULT_CHAIN,
}: MlinkProviderProps) {
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      defaultChain,
    }),
    [resolvedTheme, defaultChain]
  );

  return (
    <MlinkContext.Provider value={value}>{children}</MlinkContext.Provider>
  );
}

export function useMlinkContext(): MlinkContextValue {
  const context = useContext(MlinkContext);
  if (!context) {
    // Return defaults if not wrapped in provider
    return {
      theme: resolveTheme('dark'),
      defaultChain: DEFAULT_CHAIN,
    };
  }
  return context;
}
